'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { Recommendation } from '../types/Recommendation';
import { Message } from '../types/Message'; 
import { Box, Button, TextField, Typography } from '@mui/material';

export default function ChatBot() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!isAuthenticated || !user?.email) return loginWithRedirect();

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: user.email, message: currentInput }),
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const data = await res.json();
      const botMessage: Message = {
        role: 'bot',
        content: data.message || 'No response from bot.',
        recommendations: data.recommendations || [],
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: 'Oops! Something went wrong.', recommendations: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#111', color: '#fff' }}>
      <Navbar />

      <Box
        sx={{
          flex: 1,
          maxWidth: 900,
          mx: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Chat messages */}
        <Box
          sx={{
            flex: 1,
            minHeight: 300,
            p: 3,
            borderRadius: 2,
            backgroundColor: "#1c1c1c",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {messages.length === 0 && (
            <Typography sx={{ textAlign: 'center', color: 'grey.500', mt: 4 }}>
              Ask me for product recommendations! Try &quot;show me some shorts&quot; or &quot;I need a blue jacket&quot;
            </Typography>
          )}

          {messages.map((m, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: m.role === 'bot' ? 'flex-start' : 'flex-end' }}>
              {/* Message bubble */}
              <Box
                sx={{
                  backgroundColor: m.role === 'bot' ? '#2a2a2a' : '#0070f3',
                  color: '#fff',
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  maxWidth: '75%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxShadow: m.role === 'bot' ? 'none' : '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {m.content}
              </Box>

              {/* Recommendations */}
              {m.role === 'bot' && m.recommendations && m.recommendations.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 2,
                    mt: 1,
                  }}
                >
                  {m.recommendations.map((p) => (
                    <Box
                      key={p.id}
                      onClick={() => handleProductClick(p.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        overflow: 'hidden',
                        backgroundColor: '#1c1c1c',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': { transform: 'scale(1.05)', boxShadow: '0 6px 18px rgba(0,0,0,0.3)' },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: 150,
                          borderRadius: 1,
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: '#2a2a2a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {p.link ? (
                          <img
                            src={p.link}
                            alt={p.name.replace(/\.$/, '')}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Typography sx={{ color: 'grey.500', fontSize: 12 }}>No Image</Typography>
                        )}

                        {p.on_sale && (
                          <Typography
                            sx={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              bgcolor: '#ff4444',
                              color: '#fff',
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 0.5,
                              fontSize: 10,
                              fontWeight: 'bold',
                            }}
                          >
                            SALE
                          </Typography>
                        )}
                      </Box>

                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#fff', lineHeight: 1.2 }} noWrap>
                        {p.name.replace(/\.$/, '')}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {p.on_sale && p.discounted_price ? (
                          <>
                            <Typography sx={{ fontSize: 14, fontWeight: 'bold', color: '#ff4444' }}>
                              ${p.discounted_price}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: 'grey.500', textDecoration: 'line-through' }}>
                              ${p.price}
                            </Typography>
                          </>
                        ) : (
                          <Typography sx={{ fontSize: 14, fontWeight: 'bold', color: '#0070f3' }}>
                            ${p.price}
                          </Typography>
                        )}
                      </Box>

                      <Typography sx={{ fontSize: 11, color: 'grey.400' }}>{p.baseColour}</Typography>
                      {p.reason && (
                        <Typography sx={{ fontSize: 10, color: 'grey.500', fontStyle: 'italic' }} noWrap>
                          💡 {p.reason}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box sx={{ bgcolor: '#2a2a2a', px: 3, py: 1.5, borderRadius: 3, color: 'grey.400', maxWidth: '75%' }}>
                Bot is typing...
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask for product recommendations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !loading) sendMessage(); }}
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#1c1c1c",
                borderRadius: 2,
                color: "#fff",
                minHeight: 48,
                "& fieldset": { borderColor: "grey.700" },
                "&:hover fieldset": { borderColor: "grey.500" },
                "&.Mui-focused fieldset": { borderColor: "#0070f3" },
                "& input::placeholder": { color: "grey.500" },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            sx={{
              height: 48,
              px: 3,
              bgcolor: "#0070f3",
              color: "#fff",
              whiteSpace: "nowrap",
              "&:disabled": { bgcolor: "grey.700", color: "grey.400" },
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

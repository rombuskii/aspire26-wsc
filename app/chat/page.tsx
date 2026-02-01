'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';

interface Recommendation {
  id: string;
  name: string;
  link: string;
  price: number;
  discounted_price?: number;
  on_sale: boolean;
  baseColour: string;
  reason?: string;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
  recommendations?: Recommendation[];
}

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
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Bot response:', data);

      const botMessage: Message = { 
        role: 'bot', 
        content: data.message || 'No response from bot.',
        recommendations: data.recommendations || []
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const botMessage: Message = { 
        role: 'bot', 
        content: 'Oops! Something went wrong. Please try again.',
        recommendations: []
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 800,
          margin: '20px auto',
          gap: 12,
          width: '100%',
          padding: '0 20px',
        }}
      >
        {/* Chat messages */}
        <div
          style={{
            flex: 1,
            minHeight: 300,
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 12,
            backgroundColor: '#f9f9f9',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              marginTop: 20 
            }}>
              Ask me for product recommendations! Try &quot;show me some shorts&quot; or &quot;I need a blue jacket&quot;
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Message bubble */}
              <div
                style={{
                  alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end',
                  backgroundColor: m.role === 'bot' ? '#e0e0e0' : '#0070f3',
                  color: m.role === 'bot' ? '#000' : '#fff',
                  padding: '8px 12px',
                  borderRadius: 16,
                  maxWidth: '80%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>

              {/* Product recommendations */}
              {m.role === 'bot' && m.recommendations && m.recommendations.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: 12,
                  marginTop: 8,
                  width: '100%',
                }}>
                  {m.recommendations.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: 8,
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Product Image */}
                      <div style={{
                        width: '100%',
                        height: 150,
                        backgroundColor: '#f0f0f0',
                        borderRadius: 4,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}>
                        {product.link ? (
                          <img
                            src={product.link}
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div style={{ color: '#999', fontSize: 12 }}>No Image</div>
                        )}
                        {product.on_sale && (
                          <div style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: '#ff4444',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 'bold',
                          }}>
                            SALE
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <div style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#333',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: 36,
                      }}>
                        {product.name}
                      </div>

                      {/* Price */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {product.on_sale && product.discounted_price ? (
                          <>
                            <span style={{
                              fontSize: 14,
                              fontWeight: 'bold',
                              color: '#ff4444',
                            }}>
                              ${product.discounted_price}
                            </span>
                            <span style={{
                              fontSize: 12,
                              color: '#999',
                              textDecoration: 'line-through',
                            }}>
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#0070f3',
                          }}>
                            ${product.price}
                          </span>
                        )}
                      </div>

                      {/* Color */}
                      <div style={{
                        fontSize: 10,
                        color: '#666',
                      }}>
                        {product.baseColour}
                      </div>

                      {/* Reason (if provided) */}
                      {product.reason && (
                        <div style={{
                          fontSize: 11,
                          color: '#666',
                          fontStyle: 'italic',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          borderTop: '1px solid #eee',
                          paddingTop: 6,
                          marginTop: 2,
                        }}>
                          💡 {product.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ 
              alignSelf: 'flex-start', 
              backgroundColor: '#e0e0e0', 
              padding: '8px 12px', 
              borderRadius: 16 
            }}>
              Bot is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
            placeholder="Ask for product recommendations..."
            disabled={loading}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 16,
              opacity: loading ? 0.6 : 1,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 20px',
              fontSize: 16,
              borderRadius: 8,
              border: 'none',
              backgroundColor: loading || !input.trim() ? '#ccc' : '#0070f3',
              color: '#fff',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
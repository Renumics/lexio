import { useState } from 'react'
import { RAGProvider, ChatWindow, AdvancedQueryField, SourcesDisplay, ErrorDisplay } from 'lexio'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import './App.css'

interface Message {
  role: string;
  content: string;
}

interface Source {
  doc_path: string;
  text: string;
  id: string;
  score: number;
}

function App() {
  return (
    <div className="app-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <RAGProvider
        retrieveAndGenerate={async (messages) => {
          const lastMessage = messages[messages.length - 1];
          
          try {
            const response = await fetchEventSource('http://localhost:8000/api/retrieve-and-generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query: lastMessage.content }),
            });

            return {
              sources: Promise.resolve(response.sources || []),
              response: (async function* () {
                for await (const chunk of response) {
                  if (chunk.content) {
                    yield { content: chunk.content, done: false };
                  }
                  if (chunk.done) {
                    yield { content: '', done: true };
                  }
                }
              })()
            };
          } catch (error) {
            console.error('Error:', error);
            throw error;
          }
        }}
      >
        <div style={{ 
          display: 'grid',
          height: '100vh',
          gridTemplateColumns: '3fr 1fr',
          gridTemplateRows: '1fr auto 300px',
          gap: '20px',
          gridTemplateAreas: `
            "chat sources"
            "input sources"
            "viewer viewer"
          `
        }}>
          {/* Chat Window */}
          <div style={{ gridArea: 'chat' }}>
            <ChatWindow />
          </div>

          {/* Input Field */}
          <div style={{ gridArea: 'input' }}>
            <AdvancedQueryField />
          </div>

          {/* Sources Panel */}
          <div style={{ gridArea: 'sources' }}>
            <SourcesDisplay />
          </div>

          {/* Content Viewer */}
          <div style={{ 
            gridArea: 'viewer',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            overflowY: 'auto'
          }}>
            <h3>Content Viewer</h3>
            {/* Add content viewer implementation as needed */}
          </div>
        </div>
        <ErrorDisplay />
      </RAGProvider>
    </div>
  )
}

export default App

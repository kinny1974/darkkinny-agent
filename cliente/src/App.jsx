import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  CssBaseline,
  Grid,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Send, MessageSquare, Trash2, RefreshCcw } from 'lucide-react'; // Using lucide-react for icons
import Tooltip from '@mui/material/Tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  // Define a custom theme for Material-UI
  const theme = createTheme({
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    palette: {
      mode: 'dark',
      primary: {
        main: '#80cbc4', // Light teal/cyan to harmonize with orange secondary
      },
      secondary: {
        main: '#ffcc80', // Light orange for dark mode
      },
      background: {
        default: '#121212', // Dark background
        paper: '#1e1e1e', // Darker paper background
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          },
        },
      },
    },
  });

  // State to store conversation messages
  const [messages, setMessages] = useState([]);
  // State for the user's input prompt
  const [inputPrompt, setInputPrompt] = useState('');
  // State for the user's code snippet input
  const [inputCode, setInputCode] = useState('');
  // State to store the content of the selected folder
  const [selectedFolderContent, setSelectedFolderContent] = useState([]);
  // State to manage loading indicator
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedLlm, setSelectedLlm] = useState(false); // New state for LLM selection
  const [conversationStarted, setConversationStarted] = useState(false); // New state to track conversation start

  // Ref to scroll to the bottom of the chat
  const messagesEndRef = useRef(null);

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/models');
        if (!response.ok) {
          throw new Error('Error al cargar modelos.');
        }
        const data = await response.json();
        setAvailableModels(data.models);
        if (data.models.length > 0) {
          setSelectedModel(data.models[0]); // Select the first model by default
          setSelectedLlm(true); // Set selectedLlm to true after a model is selected
        }
      } catch (error) {
        console.error('Error al cargar los modelos de LLM:', error);
        setMessages((prevMessages) => [...prevMessages, { role: 'system', content: `Error: ${error.message || 'No se pudieron cargar los modelos de LLM.'}` }]);
      }
    };
    fetchModels();
  }, []); // Empty dependency array means this runs once on mount

  // Function to send message to the backend
  const handleSendMessage = async () => {
    if (!inputPrompt.trim() && !inputCode.trim()) return; // Don't send empty messages

    setIsLoading(true);

    // Add user message to chat history
    const userMessage = {
      role: 'user',
      content: inputPrompt,
      code: inputCode, // Include code snippet if provided
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // API call to Node.js backend
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputPrompt, code: inputCode, folderContent: selectedFolderContent, model_name: selectedModel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Algo salió mal en el servidor.');
      }

      const agentResponse = await response.json();
      setMessages((prevMessages) => [...prevMessages, agentResponse]);
      setConversationStarted(true); // Set to true after first message is sent

    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setMessages((prevMessages) => [...prevMessages, { role: 'system', content: `Error: ${error.message || 'No se pudo conectar con el agente.'}` }]);
    } finally {
      setIsLoading(false);
      setInputPrompt(''); // Clear input after sending
      setInputCode(''); // Clear code input after sending
    }
  };

  // Function to clear all messages
  const handleClearChat = () => {
    setMessages([]);
  };

  const handleFolderSelect = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    setIsLoading(true);
    const folderContent = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Only read text-based files for now
      if (file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/javascript') {
        try {
          const content = await file.text();
          folderContent.push({
            path: file.webkitRelativePath,
            content: content,
          });
        } catch (error) {
          console.error(`Error reading file ${file.webkitRelativePath}:`, error);
        }
      }
    }

    try {
      const response = await fetch('http://localhost:3001/api/upload-folder-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar el contenido de la carpeta.');
      }

      // Store the folder content in state
      setSelectedFolderContent(folderContent);

      const result = await response.json();
      setMessages((prevMessages) => [...prevMessages, { role: 'system', content: result.message }]);

    } catch (error) {
      console.error('Error al enviar el contenido de la carpeta:', error);
      setMessages((prevMessages) => [...prevMessages, { role: 'system', content: `Error: ${error.message || 'No se pudo enviar el contenido de la carpeta.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setSelectedModel(''); // Clear selected model
    setSelectedLlm(false); // Hide the chat interface
    setMessages([]); // Clear messages
    setIsLoading(false); // Stop any loading
    setConversationStarted(false); // Reset conversation started state
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <Box
            component="img"
            src="/logo_darkkinny.png"
            alt="DarkKinny Logo"
            sx={{
              height: 40,
              width: 40,
              borderRadius: '50%',
              marginRight: 2,
              objectFit: 'cover',
            }}
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: '"Star Jedi", sans-serif' }}>
            DarkKinny - Asistente de Programación (MCP/A2A)
          </Typography>
          {selectedLlm && conversationStarted && ( // Show restart button only when LLM is selected and conversation started
            <Tooltip title="Reiniciar Agente">
              <IconButton
                color="secondary"
                onClick={handleRestart}
                sx={{ mr: 2 }}
              >
                <RefreshCcw />
              </IconButton>
            </Tooltip>
          )}
          <FormControl sx={{ minWidth: 120, ml: 'auto' }} size="small" color="secondary">
            <InputLabel id="llm-select-label">Seleccionar LLM</InputLabel>
            <Select
              labelId="llm-select-label"
              id="llm-select"
              value={selectedModel}
              label="Seleccionar LLM"
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setSelectedLlm(true); // Set selectedLlm to true when a model is manually selected
              }}
              disabled={isLoading || availableModels.length === 0}
            >
              {availableModels.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2}>
          {/* Chat Display Area */}
          <Grid item xs={12}>
            <Box
              sx={{
                position: 'relative',
                height: '60vh',
                overflowY: 'auto',
                backgroundImage: 'url(/Darkkinny_background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                opacity: 1, // Always visible background
                borderRadius: 12,
                p: 2, // Padding for the background box
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                  backgroundColor: 'rgba(0,0,0,0)', // Make paper transparent
                }}
              >
                {messages.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      maxWidth: '80%',
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      borderRadius: 8,
                      borderTopLeftRadius: 0,
                    }}
                  >
                    <Typography variant="body2" sx={{ textAlign: 'left', color: theme.palette.text.primary }}>
                      ¡Hola!, soy DarkKinny un agente del lado oscuro.<br />¿En qué puedo ayudarte hoy con Node.js, React.js, FastAPI o Python?
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        maxWidth: '80%',
                        backgroundColor: msg.role === 'user' ? theme.palette.secondary.light : theme.palette.background.paper,
                        color: msg.role === 'user' ? '#CC5500' : theme.palette.text.primary,
                        borderRadius: 8,
                        borderTopRightRadius: msg.role === 'user' ? 0 : 8,
                        borderTopLeftRadius: msg.role === 'user' ? 8 : 0,
                      }}
                    >
                      <Typography variant="body2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          children={msg.content}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={dark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        />
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      maxWidth: '80%',
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      borderRadius: 8,
                      borderTopLeftRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      El agente está pensando...
                    </Typography>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} /> {/* Element to scroll to */}
            </Paper>
            </Box>
          </Grid>

          {/* Input Area */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
              <TextField
                fullWidth
                label="Tu pregunta o prompt (ej. 'React: ¿Cómo crear un componente?')"
                variant="outlined"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new line in prompt
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                sx={{ mb: 2 }}
                color="secondary"
              />
              <TextField
                fullWidth
                label="Fragmento de código (opcional)"
                variant="outlined"
                multiline
                rows={4}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Pega aquí tu código para que el agente tenga más contexto..."
                sx={{ mb: 2 }}
                color="secondary"
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <input
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleFolderSelect}
                  style={{ display: 'none' }}
                  id="folder-upload-input"
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => document.getElementById('folder-upload-input').click()}
                  disabled={isLoading}
                  sx={{ flexGrow: 0.5 }}
                >
                  Cargar Carpeta
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputPrompt.trim() && !inputCode.trim())}
                  startIcon={<Send />}
                  sx={{ flexGrow: 1 }}
                >
                  {isLoading ? 'Enviando...' : 'Enviar a Agente'}
                </Button>
                <IconButton
                  color="secondary"
                  onClick={handleClearChat}
                  disabled={messages.length === 0 || isLoading}
                  aria-label="Limpiar chat"
                >
                  <Trash2 />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.background.paper,
          textAlign: 'center',
          color: theme.palette.text.secondary,
        }}
      >
        <Typography variant="body2" sx={{ fontFamily: '"Star Jedi", sans-serif' }}>
          Implementado por DarkKinny.
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: '"Star Jedi", sans-serif' }}>
          ¡Elijo el lado oscuro, antes que el servilismo de la luz!
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;

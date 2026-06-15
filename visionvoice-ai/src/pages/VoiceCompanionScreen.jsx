import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, Volume2, Bot, User, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import VoiceWave from '../components/VoiceWave'
import BottomNav from '../components/BottomNav'
import { useApp } from '../context/AppContext'
import { companionChat } from '../utils/api'

const mockResponses = [
  'I can help you with that! To read text, please go to the OCR Reader from the home screen and point your camera at the text.',
  'For identifying currency, navigate to the Currency Reader feature. Point your camera at the note and I will tell you the denomination.',
  'The medicine reader can scan prescription labels and tell you the dosage, expiry date, and any warnings.',
  'To detect objects around you, use the Object Detection feature. It will describe your surroundings.',
  'In an emergency, press the SOS button. It will contact your emergency contacts immediately.',
  'I am always here to help you navigate independently. Is there anything specific you would like to know?',
]

export default function VoiceCompanionScreen() {
  const { speak, language, t } = useApp()
  const greeting = { id: 1, role: 'assistant', content: t('voice.greeting'), timestamp: new Date() }
  const [messages, setMessages] = useState([greeting])
  const [isListening, setIsListening] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), role: 'user', content: text, timestamp: new Date() }
    // Recent history (excluding the initial greeting) gives the assistant conversational context.
    const history = messages.filter(m => m.id !== 1).slice(-8).map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, userMsg]); setInputText(''); setIsTyping(true)
    let response
    try { const data = await companionChat(text, { history }); response = data.response_text }
    catch (e) { response = mockResponses[Math.floor(Math.random() * mockResponses.length)] }
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: response, timestamp: new Date() }])
    setIsTyping(false); speak(response)
  }

  const handleVoiceToggle = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    if (!SR) { setIsListening(true); setTimeout(() => { setIsListening(false); sendMessage('Can you describe the nearby objects?') }, 2500); return }
    const recognition = new SR()
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN'
    recognition.interimResults = false; recognition.maxAlternatives = 1
    recognition.onresult = (event) => sendMessage(event.results[0][0].transcript)
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition; setIsListening(true); recognition.start()
  }

  const clearChat = () => setMessages([{ id: 1, role: 'assistant', content: t('voice.greeting'), timestamp: new Date() }])
  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="screen-container">
      <PageHeader title={t('voice.title')} subtitle={t('voice.subtitle')} speakText={`${t('voice.title')}. ${t('voice.subtitle')}`} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-primary-500 to-primary-700' : 'bg-surface-700'}`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[78%] group ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-surface-800 border border-surface-700 text-surface-100 rounded-tl-sm'}`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-surface-600 text-xs">{formatTime(msg.timestamp)}</span>
                {msg.role === 'assistant' && (<button onClick={() => speak(msg.content)} className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-surface-700 rounded-lg flex items-center justify-center" aria-label={t('common.listen')}><Volume2 className="w-3 h-3 text-surface-400" /></button>)}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div className="bg-surface-800 border border-surface-700 px-4 py-3 rounded-2xl rounded-tl-sm"><div className="flex gap-1 items-center h-5">{[0, 1, 2].map(i => (<div key={i} className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />))}</div></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {isListening && (
        <div className="mx-4 mb-2 p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
          <div className="flex items-center justify-between mb-2"><span className="text-primary-300 text-sm font-medium">{t('voice.listening')}</span><div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /></div>
          <VoiceWave active={isListening} bars={9} />
        </div>
      )}
      <div className="px-4 pb-28 pt-2">
        <div className="flex gap-3 items-end">
          <button onClick={handleVoiceToggle} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${isListening ? 'bg-red-500 animate-pulse shadow-glow-red' : 'bg-surface-800 hover:bg-surface-700'}`} aria-label={isListening ? t('voice.listening') : t('voice.title')}>
            {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-surface-400" />}
          </button>
          <div className="flex-1 flex gap-2">
            <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)} placeholder={t('voice.placeholder')} className="input-field flex-1 py-3 text-sm" aria-label={t('voice.placeholder')} />
            <button onClick={() => sendMessage(inputText)} disabled={!inputText.trim()} className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all" aria-label="Send"><Send className="w-5 h-5 text-white" /></button>
          </div>
          <button onClick={clearChat} className="w-12 h-12 bg-surface-800 rounded-2xl flex items-center justify-center hover:bg-surface-700 transition-colors flex-shrink-0" aria-label="Clear"><Trash2 className="w-5 h-5 text-surface-400" /></button>
        </div>
      </div>
      <BottomNav active="voice" />
    </div>
  )
}

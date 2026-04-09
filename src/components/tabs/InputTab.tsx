import { useState, useRef, useCallback } from 'react';
import { Theme } from '../../types';
import { Clipboard, Send, Mic, MicOff, Clock, Trash2, Languages } from 'lucide-react';

interface InputTabProps {
  emit: (event: string, data?: unknown) => void;
  theme: Theme;
}

type Lang = 'ru-RU' | 'en-US';

export function InputTab({ emit, theme }: InputTabProps) {
  const isDark = theme === 'dark';
  const [text, setText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [lang, setLang] = useState<Lang>('ru-RU');
  const [toast, setToast] = useState('');
  const recognitionRef = useRef<any>(null);

  const cardCls = isDark
    ? 'bg-[#12121f] border border-[#00f3ff]/10 rounded-2xl p-4'
    : 'bg-white border border-gray-100 rounded-2xl p-4 shadow-sm';

  const accent = isDark ? 'text-[#00f3ff]' : 'text-indigo-600';
  const accentBg = isDark
    ? 'bg-[#00f3ff]/20 border border-[#00f3ff]/40 text-[#00f3ff] hover:bg-[#00f3ff]/30'
    : 'bg-indigo-600 text-white hover:bg-indigo-700';

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const addToHistory = (t: string) => {
    setHistory(prev => [t, ...prev.filter(h => h !== t)].slice(0, 5));
  };

  const handlePasteAndSend = () => {
    if (!text.trim()) return;
    emit('type_text', { text, paste: true });
    addToHistory(text);
    showToast('✅ Отправлено и вставлено!');
    setText('');
  };

  const handleCopyOnly = () => {
    if (!text.trim()) return;
    emit('type_text', { text, paste: false });
    addToHistory(text);
    showToast('📋 Скопировано в буфер!');
  };

  const handleHistoryClick = (t: string) => {
    setText(t);
  };

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('❌ Браузер не поддерживает распознавание речи');
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: any) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) setVoiceText(prev => prev + ' ' + final);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
    setVoiceText('');
  }, [lang]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const sendVoice = () => {
    if (!voiceText.trim()) return;
    emit('type_text', { text: voiceText.trim(), paste: true });
    addToHistory(voiceText.trim());
    showToast('✅ Голосовой ввод отправлен!');
    setVoiceText('');
  };

  return (
    <div className="space-y-4 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all
          ${isDark ? 'bg-[#1a1a2e] text-[#00f3ff] border border-[#00f3ff]/30' : 'bg-white text-indigo-700 border border-indigo-200 shadow'}`}>
          {toast}
        </div>
      )}

      {/* Text input */}
      <div className={cardCls}>
        <div className={`flex items-center gap-2 mb-3 ${accent}`}>
          <Clipboard size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Текстовый ввод</span>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введите текст для отправки на ПК..."
          rows={5}
          className={`w-full rounded-xl px-3 py-3 text-sm outline-none resize-none transition-all
            ${isDark
              ? 'bg-[#0a0a0f] border border-[#00f3ff]/20 text-white placeholder:text-white/20 focus:border-[#00f3ff]/50'
              : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-300 focus:border-indigo-400'
            }`}
        />
        <div className="flex gap-2 mt-3">
          <button onClick={handlePasteAndSend}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${accentBg}`}>
            <Send size={16} />
            Вставить
          </button>
          <button onClick={handleCopyOnly}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95
              ${isDark
                ? 'bg-[#1a1a2e] border border-[#00f3ff]/20 text-white/70 hover:bg-[#00f3ff]/10'
                : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
              }`}>
            <Clipboard size={16} />
            Только скопировать
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className={cardCls}>
          <div className={`flex items-center justify-between mb-3`}>
            <div className={`flex items-center gap-2 ${accent}`}>
              <Clock size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">История</span>
            </div>
            <button onClick={() => setHistory([])}
              className={`text-xs flex items-center gap-1 ${isDark ? 'text-white/30 hover:text-red-400' : 'text-gray-300 hover:text-red-500'}`}>
              <Trash2 size={12} /> Очистить
            </button>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <button key={i} onClick={() => handleHistoryClick(h)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-all active:scale-98
                  ${isDark
                    ? 'bg-[#0a0a0f] border border-[#00f3ff]/10 text-white/60 hover:border-[#00f3ff]/30 hover:text-white/80'
                    : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200'
                  }`}>
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice input */}
      <div className={cardCls}>
        <div className={`flex items-center justify-between mb-3`}>
          <div className={`flex items-center gap-2 ${accent}`}>
            <Mic size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Голосовой ввод</span>
          </div>
          <div className={`flex items-center gap-1 rounded-lg overflow-hidden border ${isDark ? 'border-[#00f3ff]/20' : 'border-gray-200'}`}>
            {(['ru-RU', 'en-US'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2 py-1 text-xs font-medium transition-all flex items-center gap-1
                  ${lang === l
                    ? isDark ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-indigo-600 text-white'
                    : isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                <Languages size={10} />
                {l === 'ru-RU' ? 'RU' : 'EN'}
              </button>
            ))}
          </div>
        </div>

        {/* Mic button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95
              ${isRecording
                ? isDark
                  ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)]'
                  : 'bg-red-500 shadow-lg shadow-red-300'
                : isDark
                  ? 'bg-[#00f3ff]/20 border-2 border-[#00f3ff]/60 hover:bg-[#00f3ff]/30'
                  : 'bg-indigo-100 border-2 border-indigo-400 hover:bg-indigo-200'
              }`}>
            {isRecording && (
              <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-30" />
            )}
            {isRecording
              ? <MicOff size={36} className="text-white" />
              : <Mic size={36} className={isDark ? 'text-[#00f3ff]' : 'text-indigo-600'} />
            }
          </button>

          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
            {isRecording ? '🔴 Запись... Говорите' : 'Нажмите для записи'}
          </p>

          {voiceText && (
            <div className="w-full space-y-2">
              <div className={`w-full px-4 py-3 rounded-xl text-sm min-h-[60px]
                ${isDark
                  ? 'bg-[#0a0a0f] border border-[#00f3ff]/20 text-white/80'
                  : 'bg-gray-50 border border-gray-200 text-gray-700'
                }`}>
                {voiceText}
              </div>
              <div className="flex gap-2">
                <button onClick={sendVoice}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${accentBg}`}>
                  <Send size={14} className="inline mr-1" /> Отправить
                </button>
                <button onClick={() => setVoiceText('')}
                  className={`px-4 py-2.5 rounded-xl text-sm transition-all active:scale-95
                    ${isDark ? 'bg-[#1a1a2e] border border-white/10 text-white/40' : 'bg-gray-100 border border-gray-200 text-gray-500'}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Theme } from '../../types';
import { AlertTriangle, X, Check } from 'lucide-react';

interface SecurityTabProps {
  emit: (event: string, data?: unknown) => void;
  theme: Theme;
  isConnected: boolean;
}

interface Action {
  id: string;
  label: string;
  icon: string;
  description: string;
  confirmLevel: 0 | 1 | 2; // 0=instant, 1=confirm, 2=double confirm
  danger: boolean;
  event: string;
  data?: unknown;
}

const ACTIONS: Action[] = [
  { id: 'sleep', label: 'Спящий режим', icon: '💤', description: 'ПК уйдёт в сон', confirmLevel: 0, danger: false, event: 'power_action', data: { action: 'sleep' } },
  { id: 'hibernate', label: 'Гибернация', icon: '🌙', description: 'Сохранение состояния и выключение', confirmLevel: 1, danger: false, event: 'power_action', data: { action: 'hibernate' } },
  { id: 'lock', label: 'Заблокировать ПК', icon: '🔒', description: 'Экран блокировки', confirmLevel: 0, danger: false, event: 'power_action', data: { action: 'lock' } },
  { id: 'restart', label: 'Перезагрузить', icon: '🔄', description: 'Все несохранённые данные будут потеряны!', confirmLevel: 1, danger: true, event: 'power_action', data: { action: 'restart' } },
  { id: 'shutdown', label: 'Выключить', icon: '⭕', description: 'ВНИМАНИЕ: ПК будет выключен!', confirmLevel: 2, danger: true, event: 'power_action', data: { action: 'shutdown' } },
  { id: 'close_apps', label: 'Закрыть все приложения', icon: '🗂️', description: 'Принудительно завершить все процессы', confirmLevel: 1, danger: true, event: 'close_apps', data: {} },
  { id: 'kill_server', label: 'Убить сервер', icon: '🔴', description: 'Остановить Command Center на ПК', confirmLevel: 1, danger: true, event: 'kill_server', data: {} },
];

interface ModalProps {
  action: Action;
  stage: 1 | 2;
  onConfirm: () => void;
  onCancel: () => void;
  theme: Theme;
}

function ConfirmModal({ action, stage, onConfirm, onCancel, theme }: ModalProps) {
  const isDark = theme === 'dark';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className={`w-full max-w-sm rounded-2xl p-6 transition-colors ${isDark
        ? 'bg-[#12121f] border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
        : 'bg-white border border-red-200 shadow-xl'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-red-500/20' : 'bg-red-50'}`}>
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {stage === 2 ? '⚠️ Последнее предупреждение!' : `Подтвердите: ${action.label}`}
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              {action.icon} {action.description}
            </p>
          </div>
        </div>

        {stage === 2 && (
          <div className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
            <p className="text-sm text-red-400 font-medium">
              Вы уверены, что хотите {action.label.toLowerCase()}? Это действие нельзя отменить!
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel}
            className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95
              ${isDark ? 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                       : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}>
            <X size={16} /> Отмена
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 bg-red-500 text-white hover:bg-red-600">
            <Check size={16} /> {stage === 2 ? 'Да, выполнить!' : 'Подтверждаю'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SecurityTab({ emit, theme, isConnected }: SecurityTabProps) {
  const isDark = theme === 'dark';
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [confirmStage, setConfirmStage] = useState<1 | 2>(1);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAction = (action: Action) => {
    if (!isConnected) {
      showToast('❌ Нет соединения с сервером!');
      return;
    }
    if (action.confirmLevel === 0) {
      emit(action.event, action.data);
      showToast(`✅ ${action.label} выполнено`);
    } else {
      setPendingAction(action);
      setConfirmStage(1);
    }
  };

  const handleConfirm = () => {
    if (!pendingAction) return;
    if (pendingAction.confirmLevel === 2 && confirmStage === 1) {
      setConfirmStage(2);
    } else {
      emit(pendingAction.event, pendingAction.data);
      showToast(`✅ ${pendingAction.label} выполнено`);
      setPendingAction(null);
    }
  };

  const handleCancel = () => {
    setPendingAction(null);
  };

  return (
    <div className="space-y-4 relative">
      {/* Modal */}
      {pendingAction && (
        <ConfirmModal
          action={pendingAction}
          stage={confirmStage}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          theme={theme}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg
          ${isDark ? 'bg-[#1a1a2e] text-[#00f3ff] border border-[#00f3ff]/30' : 'bg-white text-indigo-700 border border-indigo-200 shadow'}`}>
          {toast}
        </div>
      )}

      {/* Connection warning */}
      {!isConnected && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm
          ${isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
          <AlertTriangle size={16} />
          Нет соединения — действия недоступны
        </div>
      )}

      {/* Info */}
      <div className={`px-4 py-3 rounded-xl text-xs ${isDark ? 'bg-[#12121f] border border-[#00f3ff]/10 text-white/30' : 'bg-white border border-gray-100 text-gray-400 shadow-sm'}`}>
        🔒 Опасные действия требуют подтверждения. Выключение — двойного подтверждения.
      </div>

      {/* Actions grid */}
      <div className="space-y-2">
        {ACTIONS.map(action => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={!isConnected}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all active:scale-98
              ${!isConnected
                ? isDark ? 'opacity-40 bg-[#12121f] border border-white/5' : 'opacity-40 bg-white border border-gray-100 shadow-sm'
                : action.danger
                  ? isDark
                    ? 'bg-[#12121f] border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5'
                    : 'bg-white border border-red-100 hover:border-red-300 hover:bg-red-50 shadow-sm'
                  : isDark
                    ? 'bg-[#12121f] border border-[#00f3ff]/10 hover:border-[#00f3ff]/30 hover:bg-[#00f3ff]/5'
                    : 'bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm'
              }`}
          >
            <span className="text-2xl leading-none">{action.icon}</span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${action.danger
                ? isDark ? 'text-red-400' : 'text-red-600'
                : isDark ? 'text-white' : 'text-gray-800'
              }`}>{action.label}</p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                {action.description}
              </p>
            </div>
            {action.confirmLevel > 0 && (
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg
                ${isDark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400'}`}>
                <AlertTriangle size={10} />
                {action.confirmLevel === 2 ? '×2' : '×1'}
              </div>
            )}
            {action.confirmLevel === 0 && (
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg
                ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                ⚡ Быстро
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

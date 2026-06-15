import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, Volume2, Clock, Scan, Eye, Pill, Banknote, Palette, Bot } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'
import { useApp } from '../context/AppContext'
import { getHistory, deleteHistory, clearHistory } from '../utils/api'

const ICON_MAP = { scan: Scan, eye: Eye, pill: Pill, banknote: Banknote, palette: Palette, bot: Bot }
const COLOR_MAP = {
  blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20' },
  green: { bg: 'bg-green-500/10', icon: 'text-green-400', border: 'border-green-500/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', border: 'border-orange-500/20' },
  yellow: { bg: 'bg-yellow-500/10', icon: 'text-yellow-400', border: 'border-yellow-500/20' },
}
const FILTERS = ['All', 'OCR', 'Object', 'Medicine', 'Currency', 'Color']
const FILTER_KEY = { All: 'his.all', OCR: 'his.fOCR', Object: 'his.fObject', Medicine: 'his.fMedicine', Currency: 'his.fCurrency', Color: 'his.fColor' }

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

const normalize = (item) => ({
  id: item._id || item.id, type: item.type, icon: item.icon || 'scan', color: item.color || 'blue',
  title: item.title, preview: item.preview || item.aiSummary || '', timestamp: item.createdAt || item.timestamp || new Date(),
})

export default function HistoryScreen() {
  const { history, speak, t } = useApp()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (activeFilter !== 'All') params.type = activeFilter
      const data = await getHistory(params)
      setItems(data.map(normalize)); setOffline(false)
    } catch (e) { setItems(history.map(normalize)); setOffline(true) }
    finally { setLoading(false) }
  }, [search, activeFilter, history])

  useEffect(() => { const tm = setTimeout(load, 250); return () => clearTimeout(tm) }, [load])

  const filtered = offline
    ? items.filter((item) => {
        const s = search.toLowerCase()
        const matchSearch = item.title.toLowerCase().includes(s) || item.preview.toLowerCase().includes(s)
        const matchFilter = activeFilter === 'All' || item.type === activeFilter
        return matchSearch && matchFilter
      })
    : items

  const handleDelete = async (id) => { setItems(prev => prev.filter(h => h.id !== id)); try { await deleteHistory(id) } catch (e) {} }
  const handleClearAll = async () => { setItems([]); try { await clearHistory() } catch (e) {} }

  return (
    <div className="screen-container">
      <PageHeader title={t('his.title')} subtitle={`${filtered.length} ${t('his.scansSaved')}`} speakText={t('his.title')} />
      <div className="px-4 pb-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
          <input type="search" placeholder={t('his.search')} value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-12" aria-label={t('his.search')} />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeFilter === f ? 'bg-primary-500 text-white' : 'bg-surface-800 text-surface-400 hover:bg-surface-700'}`} aria-pressed={activeFilter === f}>{t(FILTER_KEY[f])}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28">
        {filtered.length > 0 && (
          <div className="flex items-center justify-between py-3">
            <p className="text-surface-500 text-sm">{filtered.length} {t('common.results')}{offline ? ` · ${t('common.offline')}` : ''}</p>
            <button onClick={handleClearAll} className="text-red-400 text-sm font-medium hover:text-red-300" aria-label={t('his.clearAll')}>{t('his.clearAll')}</button>
          </div>
        )}
        {loading && items.length === 0 ? (
          <div className="text-center py-16 text-surface-500 text-sm">{t('his.loading')}</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => {
              const Icon = ICON_MAP[item.icon] || Scan
              const colors = COLOR_MAP[item.color] || COLOR_MAP.blue
              return (
                <div key={item.id} className={`bg-surface-900 border ${colors.border} rounded-2xl p-4 flex items-start gap-4 animate-fade-in`}>
                  <div className={`w-11 h-11 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 border ${colors.border}`}><Icon className={`w-5 h-5 ${colors.icon}`} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div><p className="text-white font-semibold text-sm">{item.title}</p><p className="text-surface-500 text-xs mt-0.5">{item.type}</p></div>
                      <div className="flex items-center gap-1 text-surface-600 text-xs flex-shrink-0"><Clock className="w-3 h-3" /><span>{timeAgo(item.timestamp)}</span></div>
                    </div>
                    <p className="text-surface-400 text-xs mt-2 leading-relaxed line-clamp-2">{item.preview}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => speak(item.preview)} className="w-8 h-8 bg-primary-500/20 rounded-xl flex items-center justify-center hover:bg-primary-500/30 transition-colors" aria-label={t('common.listen')}><Volume2 className="w-4 h-4 text-primary-400" /></button>
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center hover:bg-red-500/20 transition-colors" aria-label="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-surface-800 rounded-3xl flex items-center justify-center"><Clock className="w-8 h-8 text-surface-600" /></div>
            <div className="text-center"><p className="text-white font-semibold">{t('his.empty')}</p><p className="text-surface-500 text-sm mt-1">{search ? t('his.emptySearch') : t('his.emptyHint')}</p></div>
          </div>
        )}
      </div>
      <BottomNav active="history" />
    </div>
  )
}

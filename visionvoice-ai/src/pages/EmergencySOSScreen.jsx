import { useState, useEffect } from 'react'
import { AlertTriangle, Phone, Plus, Trash2, X, Shield, MessageCircle, Send } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'
import { useApp } from '../context/AppContext'
import { getContacts, addContact, deleteContact, triggerSOS } from '../utils/api'

const RELATION_COLORS = {
  Family: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Doctor: 'bg-green-500/10 text-green-400 border-green-500/20',
  Friend: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Other: 'bg-surface-700 text-surface-400 border-surface-600',
}

// Keep digits only, drop leading + and zeros for wa.me (expects country code + number).
const waNumber = (phone) => (phone || '').replace(/[^\d]/g, '').replace(/^0+/, '')
const telNumber = (phone) => (phone || '').replace(/[^\d+]/g, '')

export default function EmergencySOSScreen() {
  const { emergencyContacts, setEmergencyContacts, speak, t } = useApp()
  const [sosActive, setSosActive] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'Family' })
  const [sosMessage, setSosMessage] = useState('')   // built message incl. location
  const [showSend, setShowSend] = useState(false)
  const [sosStatus, setSosStatus] = useState(null)   // { ok: bool, text } delivery result

  const relLabel = { Family: t('sos.relFamily'), Doctor: t('sos.relDoctor'), Friend: t('sos.relFriend'), Other: t('sos.relOther') }

  useEffect(() => {
    let cancelled = false
    getContacts().then((list) => {
      if (cancelled || !Array.isArray(list)) return
      setEmergencyContacts(list.map((c) => ({ id: c._id, name: c.name, phone: c.phone, relation: c.relation })))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [setEmergencyContacts])

  const getLocation = () => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy_meters: pos.coords.accuracy }),
      () => resolve(null), { enableHighAccuracy: true, timeout: 6000 })
  })

  const buildMessage = (location) => {
    const loc = location
      ? `${t('sos.myLocation')}: ${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}`
      : t('sos.noLoc')
    return `${t('sos.msg')} ${loc}`
  }

  // Fire: get location, then have the BACKEND send a REAL SMS directly to each contact's
  // number, server-side and in real time. NOTHING opens on the user's device.
  const fireAlerts = async () => {
    const location = await getLocation()
    const msg = buildMessage(location)
    setSosMessage(msg)
    setShowSend(true)
    if (!emergencyContacts.length) {
      setSosStatus({ ok: false, text: 'No emergency contacts saved. Add a contact first.' })
      speak('No emergency contacts saved. Please add a contact first.')
      return
    }

    setSosStatus({ ok: null, text: 'Sending emergency text messages…' })
    speak('Sending emergency text messages to your contacts.')

    let sent = false
    let notified = []
    let provider = 'unknown'
    let results = []
    let reqError = null
    try {
      const res = await triggerSOS(location)   // server-side real SMS — nothing opens
      sent = !!res.sent
      notified = res.contacts_notified || []
      provider = res.provider || 'unknown'
      results = res.results || []
    } catch (e) { reqError = e.message }

    if (sent) {
      const names = notified.join(', ')
      const text = `Text message sent to ${notified.length} contact${notified.length === 1 ? '' : 's'}${names ? ': ' + names : ''}.`
      setSosStatus({ ok: true, text })
      speak(`Emergency ${text}`)
      return
    }

    // Not sent — surface the REAL reason so it can be fixed (no app is opened automatically).
    let reason
    if (reqError) reason = `Could not reach the backend (${reqError}). Make sure the server is running.`
    else if (provider === 'simulated') reason = 'No SMS gateway is active on the server. Add FAST2SMS_API_KEY (or Twilio) to backend/.env and RESTART the backend.'
    else {
      const firstErr = results.find((r) => r.error)?.error
      reason = `${provider} could not send: ${firstErr || 'unknown error'}. Check the API key, account balance, and that the number is valid.`
    }
    setSosStatus({ ok: false, text: `${reason} You can also tap a contact below to send manually.` })
    speak('Could not send automatically. Please check the on-screen message, or tap a contact to send manually.')
  }

  const handleSOS = () => {
    if (sosActive) { setSosActive(false); setCountdown(null); speak('Emergency cancelled'); return }
    setSosActive(true)
    speak('Emergency SOS activated. Sending to your emergency contacts in 5 seconds. Tap again to cancel.')
    let c = 5; setCountdown(c)
    const interval = setInterval(() => {
      c -= 1; setCountdown(c)
      if (c <= 0) { clearInterval(interval); setSosActive(false); setCountdown(null); fireAlerts() }
    }, 1000)
  }

  const sendWhatsApp = (c) => window.open(`https://wa.me/${waNumber(c.phone)}?text=${encodeURIComponent(sosMessage || buildMessage(null))}`, '_blank')
  const sendSMS = (c) => { window.location.href = `sms:${telNumber(c.phone)}?body=${encodeURIComponent(sosMessage || buildMessage(null))}` }

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return
    try { const saved = await addContact(newContact); setEmergencyContacts(prev => [...prev, { id: saved._id, name: saved.name, phone: saved.phone, relation: saved.relation }]) }
    catch (e) { setEmergencyContacts(prev => [...prev, { ...newContact, id: Date.now() }]) }
    setNewContact({ name: '', phone: '', relation: 'Family' }); setShowAdd(false)
  }
  const handleDelete = async (id) => { setEmergencyContacts(prev => prev.filter(c => c.id !== id)); try { await deleteContact(id) } catch (e) {} }

  return (
    <div className="screen-container">
      <PageHeader title={t('sos.title')} subtitle={t('sos.subtitle')} speakText={`${t('sos.title')}. ${t('sos.hint')}`} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 space-y-6">
        <div className="flex flex-col items-center py-6">
          <div className="relative">
            {sosActive && (<><div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping scale-125" /><div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150" style={{ animationDelay: '0.3s' }} /></>)}
            <button onClick={handleSOS} className="sos-btn" aria-label={t('sos.label')} aria-live="polite">
              <div className="flex flex-col items-center gap-1"><AlertTriangle className="w-12 h-12 text-white" strokeWidth={1.5} /><span className="text-white font-black text-lg tracking-wide">{sosActive && countdown !== null ? countdown : 'SOS'}</span></div>
            </button>
          </div>
          <div className="mt-6 text-center">
            {sosActive ? (<><p className="text-red-400 font-bold text-base">{t('sos.activating')} {countdown}s</p><p className="text-surface-400 text-sm mt-1">{t('sos.cancelHint')}</p></>)
            : (<><p className="text-white font-semibold text-base">{t('sos.label')}</p><p className="text-surface-400 text-sm mt-1">{t('sos.hint')}</p></>)}
          </div>
        </div>

        {showSend && emergencyContacts.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <p className="text-red-300 font-semibold text-sm">{t('sos.sentPanel')}</p>
              <button onClick={() => setShowSend(false)} className="w-7 h-7 bg-surface-800 rounded-lg flex items-center justify-center" aria-label={t('sos.close')}><X className="w-4 h-4 text-surface-400" /></button>
            </div>
            {sosStatus && (
              <div className={`mb-3 rounded-2xl px-3 py-2 text-xs leading-relaxed ${sosStatus.ok === true ? 'bg-green-500/15 text-green-300 border border-green-500/30' : sosStatus.ok === false ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' : 'bg-surface-800 text-surface-300 border border-surface-700'}`} role="status" aria-live="polite">
                {sosStatus.text}
              </div>
            )}
            <div className="space-y-2">
              {emergencyContacts.map((c) => (
                <div key={c.id} className="flex items-center gap-2 bg-surface-900 rounded-2xl p-2.5">
                  <span className="flex-1 text-white text-sm font-medium truncate">{c.name}</span>
                  <button onClick={() => sendWhatsApp(c)} className="flex items-center gap-1 bg-green-500/20 text-green-400 rounded-lg px-2.5 py-1.5 text-xs font-semibold" aria-label={`${t('sos.whatsapp')} ${c.name}`}><MessageCircle className="w-3.5 h-3.5" />{t('sos.whatsapp')}</button>
                  <button onClick={() => sendSMS(c)} className="flex items-center gap-1 bg-blue-500/20 text-blue-400 rounded-lg px-2.5 py-1.5 text-xs font-semibold" aria-label={`${t('sos.sms')} ${c.name}`}><Send className="w-3.5 h-3.5" />{t('sos.sms')}</button>
                  <a href={`tel:${telNumber(c.phone)}`} className="flex items-center gap-1 bg-surface-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold" aria-label={`${t('sos.call')} ${c.name}`}><Phone className="w-3.5 h-3.5" /></a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-surface-900 border border-surface-800 rounded-3xl p-4">
          <div className="flex items-start gap-3"><Shield className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" /><div><p className="text-white font-semibold text-sm">{t('sos.how')}</p><p className="text-surface-400 text-xs mt-1 leading-relaxed">{t('sos.howDesc')}</p></div></div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">{t('sos.contacts')}</h2>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 text-primary-400 text-sm font-medium px-3 py-1.5 bg-primary-500/10 rounded-xl hover:bg-primary-500/20 transition-colors" aria-label={t('sos.addContact')}><Plus className="w-4 h-4" />{t('sos.add')}</button>
          </div>
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="bg-surface-900 border border-surface-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-surface-700 to-surface-800 rounded-2xl flex items-center justify-center flex-shrink-0"><span className="text-white font-bold">{contact.name?.[0] || '?'}</span></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{contact.name}</p>
                  <p className="text-surface-400 text-xs mt-0.5">{contact.phone}</p>
                  <span className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${RELATION_COLORS[contact.relation] || RELATION_COLORS.Other}`}>{relLabel[contact.relation] || contact.relation}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => sendWhatsApp(contact)} className="w-9 h-9 bg-green-500/15 rounded-xl flex items-center justify-center hover:bg-green-500/25" aria-label={`${t('sos.whatsapp')} ${contact.name}`}><MessageCircle className="w-4 h-4 text-green-400" /></button>
                  <a href={`tel:${telNumber(contact.phone)}`} className="w-9 h-9 bg-primary-500/15 rounded-xl flex items-center justify-center hover:bg-primary-500/25" aria-label={`${t('sos.call')} ${contact.name}`}><Phone className="w-4 h-4 text-primary-400" /></a>
                  <button onClick={() => handleDelete(contact.id)} className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center hover:bg-red-500/20" aria-label={`Delete ${contact.name}`}><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="w-full max-w-md bg-surface-900 border border-surface-800 rounded-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5"><h3 className="font-bold text-white text-lg">{t('sos.addContact')}</h3><button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-surface-800 rounded-xl flex items-center justify-center" aria-label={t('sos.close')}><X className="w-4 h-4 text-surface-400" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder={t('sos.name')} value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} className="input-field" aria-label={t('sos.name')} />
              <input type="tel" placeholder={`${t('sos.phone')} (+91...)`} value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} className="input-field" aria-label={t('sos.phone')} />
              <select value={newContact.relation} onChange={e => setNewContact(p => ({ ...p, relation: e.target.value }))} className="input-field" aria-label={t('set.language')}>
                <option value="Family">{t('sos.relFamily')}</option>
                <option value="Doctor">{t('sos.relDoctor')}</option>
                <option value="Friend">{t('sos.relFriend')}</option>
                <option value="Other">{t('sos.relOther')}</option>
              </select>
              <button onClick={handleAddContact} className="w-full btn-primary mt-2" aria-label={t('sos.addContact')}>{t('sos.addContact')}</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav active="emergency" />
    </div>
  )
}

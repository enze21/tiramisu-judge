import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ⚠️ INSERISCI QUI LE TUE CREDENZIALI SUPABASE
const SUPABASE_URL = "https://xxxxxxxxxxxxxxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// ⚠️ EMAIL DEGLI AMMINISTRATORI (oltre al flag is_admin su Supabase)
const ADMIN_EMAILS = ["admin@tuodominio.com"];

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CRITERI = [
  { id: "equilibrio", label: "Equilibrio Sapori", emoji: "⚖️" },
  { id: "presentazione", label: "Presentazione", emoji: "🎨" },
  { id: "crema", label: "Crema", emoji: "🍮" },
  { id: "savoiardi", label: "Savoiardi", emoji: "🍪" },
  { id: "caffe", label: "Caffè", emoji: "☕" },
  { id: "cacao", label: "Cacao", emoji: "🍫" },
  { id: "consistenza", label: "Consistenza", emoji: "✨" },
];

const defaultVoti = () => Object.fromEntries(CRITERI.map((c) => [c.id, 0]));

function getMedia(voti) {
  const vals = Object.values(voti).filter((v) => v > 0);
  if (vals.length === 0) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function getGiudizio(media) {
  if (!media) return { testo: "—", colore: "#b0a090" };
  const m = parseFloat(media);
  if (m >= 9) return { testo: "Capolavoro 🏆", colore: "#c8a84b" };
  if (m >= 7.5) return { testo: "Eccellente 🌟", colore: "#8fb87a" };
  if (m >= 6) return { testo: "Buono 👍", colore: "#7ab8a0" };
  if (m >= 4.5) return { testo: "Discreto 🤔", colore: "#c4a05a" };
  return { testo: "Da migliorare 😕", colore: "#c47a7a" };
}

function VotoInput({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {[...Array(10)].map((_, i) => {
        const v = i + 1;
        const active = value === v;
        return (
          <button key={v} onClick={() => onChange(active ? 0 : v)} style={{
            width: 34, height: 34, borderRadius: 6,
            border: active ? "2px solid #c8a84b" : "1.5px solid #4a3f35",
            background: active ? "linear-gradient(135deg, #c8a84b, #a07830)" : "rgba(255,255,255,0.04)",
            color: active ? "#fff" : "#b0a090",
            fontFamily: "'Playfair Display', serif",
            fontWeight: active ? 700 : 400,
            fontSize: 13, cursor: "pointer",
            transition: "all 0.15s ease",
            transform: active ? "scale(1.08)" : "scale(1)",
          }}>{v}</button>
        );
      })}
    </div>
  );
}

function TiramisuCard({ tiramisu, isOwn, isAdmin, onDelete }) {
  const giudizio = getGiudizio(tiramisu.media);
  const [open, setOpen] = useState(false);
  const canDelete = isOwn || isAdmin;

  return (
    <div style={{
      background: isOwn ? "rgba(200,168,75,0.05)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isOwn ? "rgba(200,168,75,0.3)" : "rgba(200,168,75,0.12)"}`,
      borderRadius: 12, padding: "14px 16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {tiramisu.foto && (
            <img src={tiramisu.foto} alt="tiramisù" style={{
              width: 48, height: 48, borderRadius: 8, objectFit: "cover",
              border: "1px solid rgba(200,168,75,0.3)", flexShrink: 0,
            }} />
          )}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#f0e8d8", fontWeight: 700 }}>
              {tiramisu.nome || "Tiramisù"}
            </div>
            <div style={{ fontSize: 11, color: "#8a7a6a", marginTop: 2 }}>
              <span style={{ color: isOwn ? "#c8a84b" : "#7a8a6a" }}>
                {isOwn ? "✦ Tu" : `👤 ${tiramisu.username || "Anonimo"}`}
              </span>
              {" · "}
              {new Date(tiramisu.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
              {tiramisu.luogo && ` · ${tiramisu.luogo}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: giudizio.colore, fontWeight: 700, lineHeight: 1 }}>
              {tiramisu.media ?? "—"}
            </div>
            <div style={{ fontSize: 11, color: giudizio.colore, opacity: 0.85 }}>{giudizio.testo}</div>
          </div>
          <span style={{ color: "#8a7a6a", fontSize: 16 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 12, borderTop: "1px solid rgba(200,168,75,0.1)", paddingTop: 12 }}>
          {tiramisu.foto && (
            <img src={tiramisu.foto} alt="tiramisù" style={{
              width: "100%", maxHeight: 200, objectFit: "cover",
              borderRadius: 10, marginBottom: 12, border: "1px solid rgba(200,168,75,0.2)",
            }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {CRITERI.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#b0a090" }}>{c.emoji} {c.label}</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: tiramisu.voti[c.id] > 0 ? "#c8a84b" : "#4a3f35", fontSize: 15 }}>
                  {tiramisu.voti[c.id] > 0 ? tiramisu.voti[c.id] : "—"}
                </span>
              </div>
            ))}
          </div>
          {tiramisu.note && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(200,168,75,0.07)", borderRadius: 8, fontSize: 13, color: "#b0a090", fontStyle: "italic" }}>
              "{tiramisu.note}"
            </div>
          )}
          {canDelete && (
            <button onClick={() => onDelete(tiramisu.id)} style={{
              marginTop: 10, background: "transparent",
              border: `1px solid ${isAdmin && !isOwn ? "rgba(196,122,122,0.6)" : "rgba(196,122,122,0.4)"}`,
              color: "#c47a7a", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer",
            }}>
              {isAdmin && !isOwn ? "🛡 Elimina (admin)" : "🗑 Elimina"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PANNELLO ADMIN ───────────────────────────────────────────────────────────
function AdminPanel({ utenti, valutazioni, onToggleAdmin, onDeleteUser, currentUserId }) {
  const [tab, setTab] = useState("utenti");

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[{ id: "utenti", label: "👥 Utenti" }, { id: "stats", label: "📊 Statistiche" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "8px", borderRadius: 8,
            border: tab === t.id ? "1.5px solid #c8764b" : "1.5px solid rgba(199,118,75,0.2)",
            background: tab === t.id ? "rgba(199,118,75,0.12)" : "transparent",
            color: tab === t.id ? "#c8764b" : "#8a7a6a",
            fontFamily: "'Lora', serif", fontSize: 12, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "utenti" && (
        <div>
          <div style={{ fontSize: 11, color: "#8a7a6a", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {utenti.length} utenti registrati
          </div>
          {utenti.map((u) => {
            const isSelf = u.id === currentUserId;
            const nVal = valutazioni.filter((v) => v.user_id === u.id).length;
            const mediaU = nVal > 0
              ? (valutazioni.filter((v) => v.user_id === u.id).reduce((a, v) => a + (v.media || 0), 0) / nVal).toFixed(1)
              : "—";
            return (
              <div key={u.id} style={{
                background: u.is_admin ? "rgba(199,118,75,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${u.is_admin ? "rgba(199,118,75,0.25)" : "rgba(200,168,75,0.1)"}`,
                borderRadius: 10, padding: "12px 14px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#f0e8d8", fontWeight: 700 }}>
                        {u.username || "—"}
                      </span>
                      {u.is_admin && (
                        <span style={{ fontSize: 10, background: "rgba(199,118,75,0.2)", color: "#c8764b", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>ADMIN</span>
                      )}
                      {isSelf && (
                        <span style={{ fontSize: 10, background: "rgba(200,168,75,0.15)", color: "#c8a84b", borderRadius: 4, padding: "1px 6px" }}>Tu</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#6a6a5a", marginTop: 2 }}>{u.email || "—"}</div>
                    <div style={{ fontSize: 11, color: "#8a7a6a", marginTop: 2 }}>🍰 {nVal} valutazioni · media {mediaU}</div>
                  </div>
                  {!isSelf && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                      <button onClick={() => onToggleAdmin(u.id, u.is_admin)} style={{
                        background: "transparent", fontSize: 11, cursor: "pointer",
                        border: `1px solid ${u.is_admin ? "rgba(196,122,122,0.4)" : "rgba(199,118,75,0.4)"}`,
                        color: u.is_admin ? "#c47a7a" : "#c8764b",
                        borderRadius: 5, padding: "4px 8px",
                      }}>
                        {u.is_admin ? "Revoca admin" : "Promuovi admin"}
                      </button>
                      <button onClick={() => onDeleteUser(u.id, u.username)} style={{
                        background: "transparent", fontSize: 11, cursor: "pointer",
                        border: "1px solid rgba(196,122,122,0.3)", color: "#c47a7a",
                        borderRadius: 5, padding: "4px 8px",
                      }}>🗑 Rimuovi</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "stats" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Totale valutazioni", val: valutazioni.length, emoji: "🍰" },
            { label: "Utenti registrati", val: utenti.length, emoji: "👥" },
            { label: "Amministratori", val: utenti.filter((u) => u.is_admin).length, emoji: "🛡" },
            { label: "Media globale", emoji: "⭐", val: valutazioni.length > 0 ? (valutazioni.reduce((a, v) => a + (v.media || 0), 0) / valutazioni.length).toFixed(2) : "—" },
            { label: "Voto più alto", emoji: "🏆", val: valutazioni.length > 0 ? Math.max(...valutazioni.map((v) => v.media || 0)).toFixed(1) : "—" },
            { label: "Voto più basso", emoji: "😕", val: valutazioni.length > 0 ? Math.min(...valutazioni.filter((v) => v.media).map((v) => v.media)).toFixed(1) : "—" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(200,168,75,0.1)",
              borderRadius: 8, padding: "10px 14px",
            }}>
              <span style={{ fontSize: 13, color: "#b0a090" }}>{item.emoji} {item.label}</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#c8a84b", fontSize: 17 }}>{item.val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const stileInput = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1.5px solid #4a3f35", borderRadius: 8,
    padding: "12px 14px", color: "#f0e8d8", fontSize: 14,
    fontFamily: "'Lora', serif", outline: "none", boxSizing: "border-box",
  };

  const handleSubmit = async () => {
    setMsg(null); setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "register") {
        if (!username.trim()) { setMsg({ type: "err", text: "Inserisci un nome utente." }); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username: username.trim() } }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profili").upsert({
            id: data.user.id,
            username: username.trim(),
            is_admin: ADMIN_EMAILS.includes(email.toLowerCase()),
          });
        }
        if (data.user && !data.user.email_confirmed_at) {
          setMsg({ type: "ok", text: "Registrazione avvenuta! Controlla la tua email per confermare l'account." });
          setLoading(false); return;
        }
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
        if (error) throw error;
        setMsg({ type: "ok", text: "Email di recupero inviata! Controlla la tua casella." });
        setLoading(false); return;
      }
    } catch (e) {
      setMsg({ type: "err", text: e.message });
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1410",
      backgroundImage: "radial-gradient(ellipse at 20% 0%, rgba(200,168,75,0.1) 0%, transparent 60%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'Lora', serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🍰</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color: "#c8a84b", margin: 0 }}>Tiramisù Judge</h1>
          <p style={{ fontSize: 13, color: "#8a7a6a", margin: "6px 0 0", fontStyle: "italic" }}>Il taccuino del tiramisù perfetto</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,168,75,0.2)", borderRadius: 16, padding: "28px 24px" }}>
          {mode !== "reset" && (
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {[{ id: "login", label: "Accedi" }, { id: "register", label: "Registrati" }].map((t) => (
                <button key={t.id} onClick={() => { setMode(t.id); setMsg(null); }} style={{
                  flex: 1, padding: "9px", borderRadius: 8,
                  border: mode === t.id ? "1.5px solid #c8a84b" : "1.5px solid rgba(200,168,75,0.2)",
                  background: mode === t.id ? "rgba(200,168,75,0.12)" : "transparent",
                  color: mode === t.id ? "#c8a84b" : "#8a7a6a",
                  fontFamily: "'Lora', serif", fontSize: 13, cursor: "pointer", fontWeight: mode === t.id ? 600 : 400,
                }}>{t.label}</button>
              ))}
            </div>
          )}
          {mode === "reset" && (
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#c8a84b", fontWeight: 600, marginBottom: 4 }}>🔑 Recupero Password</div>
              <div style={{ fontSize: 12, color: "#8a7a6a" }}>Ti invieremo un link per reimpostare la password</div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mode === "register" && <input placeholder="Nome utente" value={username} onChange={(e) => setUsername(e.target.value)} style={stileInput} />}
            <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={stileInput} />
            {mode !== "reset" && <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={stileInput} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />}
          </div>
          {msg && (
            <div style={{
              marginTop: 14, padding: "10px 14px", borderRadius: 8,
              background: msg.type === "ok" ? "rgba(143,184,122,0.1)" : "rgba(196,122,122,0.1)",
              border: `1px solid ${msg.type === "ok" ? "rgba(143,184,122,0.3)" : "rgba(196,122,122,0.3)"}`,
              fontSize: 13, color: msg.type === "ok" ? "#8fb87a" : "#c47a7a",
            }}>{msg.text}</div>
          )}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", marginTop: 18, padding: "13px", borderRadius: 10, border: "none",
            background: loading ? "#3a322a" : "linear-gradient(135deg, #c8a84b, #a07830)",
            color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer",
          }}>
            {loading ? "⏳ Attendere..." : mode === "login" ? "Accedi" : mode === "register" ? "Crea Account" : "Invia Email"}
          </button>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            {mode !== "reset" ? (
              <button onClick={() => { setMode("reset"); setMsg(null); }} style={{ background: "none", border: "none", color: "#8a7a6a", fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "'Lora', serif" }}>Password dimenticata?</button>
            ) : (
              <button onClick={() => { setMode("login"); setMsg(null); }} style={{ background: "none", border: "none", color: "#c8a84b", fontSize: 12, cursor: "pointer", fontFamily: "'Lora', serif" }}>← Torna al login</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [schermata, setSchermata] = useState("classifica");
  const [tutte, setTutte] = useState([]);
  const [utenti, setUtenti] = useState([]);
  const [loadingDati, setLoadingDati] = useState(false);

  const [nome, setNome] = useState("");
  const [luogo, setLuogo] = useState("");
  const [note, setNote] = useState("");
  const [voti, setVoti] = useState(defaultVoti());
  const [salvato, setSalvato] = useState(false);
  const [foto, setFoto] = useState(null);
  const [geo, setGeo] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");
  const fileInputRef = useRef();
  const cameraInputRef = useRef();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(false); return; }
    const emailAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase());
    if (emailAdmin) { setIsAdmin(true); return; }
    supabase.from("profili").select("is_admin").eq("id", session.user.id).single()
      .then(({ data }) => setIsAdmin(data?.is_admin === true));
  }, [session]);

  const caricaDati = async () => {
    setLoadingDati(true);
    const { data } = await supabase.from("valutazioni").select("*").order("created_at", { ascending: false });
    if (data) setTutte(data);
    setLoadingDati(false);
  };

  const caricaUtenti = async () => {
    const { data } = await supabase.from("profili").select("*").order("created_at", { ascending: true });
    if (data) setUtenti(data);
  };

  useEffect(() => {
    if (session) {
      caricaDati();
      const username = session.user.user_metadata?.username || session.user.email?.split("@")[0];
      supabase.from("profili").upsert({
        id: session.user.id, username,
        is_admin: ADMIN_EMAILS.includes(session.user.email?.toLowerCase()),
      }, { onConflict: "id", ignoreDuplicates: true });
    }
  }, [session]);

  useEffect(() => { if (isAdmin) caricaUtenti(); }, [isAdmin]);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleGeo = () => {
    if (!navigator.geolocation) { setGeoStatus("error"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoStatus("ok"); },
      () => setGeoStatus("error")
    );
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSalva = async () => {
    const media = getMedia(voti);
    if (!media || !session) return;
    const username = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "Anonimo";
    const { error } = await supabase.from("valutazioni").insert({
      user_id: session.user.id, username,
      nome: nome || "Tiramisù", luogo, note, foto,
      geo_lat: geo?.lat ?? null, geo_lng: geo?.lng ?? null,
      voti: { ...voti }, media: parseFloat(media),
    });
    if (!error) {
      setSalvato(true);
      await caricaDati();
      setTimeout(() => {
        setSalvato(false); setSchermata("classifica");
        setNome(""); setLuogo(""); setNote("");
        setVoti(defaultVoti()); setFoto(null); setGeo(null); setGeoStatus("idle");
      }, 1500);
    }
  };

  const handleDelete = async (id) => {
    await supabase.from("valutazioni").delete().eq("id", id);
    await caricaDati();
  };

  const handleToggleAdmin = async (userId, attuale) => {
    await supabase.from("profili").update({ is_admin: !attuale }).eq("id", userId);
    await caricaUtenti();
  };

  const handleDeleteUser = async (userId, nomeUtente) => {
    if (!window.confirm(`Eliminare l'utente "${nomeUtente}" e tutte le sue valutazioni?`)) return;
    await supabase.from("valutazioni").delete().eq("user_id", userId);
    await supabase.from("profili").delete().eq("id", userId);
    await caricaDati();
    await caricaUtenti();
  };

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "#1a1410", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#c8a84b", fontFamily: "serif", fontSize: 18 }}>🍰 Caricamento...</div>
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  const media = getMedia(voti);
  const giudizio = getGiudizio(media);
  const mieValutazioni = tutte.filter((t) => t.user_id === session.user.id);
  const username = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "Utente";

  const statsPerUtente = Object.values(
    tutte.reduce((acc, t) => {
      if (!acc[t.user_id]) acc[t.user_id] = { username: t.username, count: 0, somma: 0 };
      acc[t.user_id].count++;
      acc[t.user_id].somma += parseFloat(t.media || 0);
      return acc;
    }, {})
  ).map((u) => ({ ...u, media: (u.somma / u.count).toFixed(1) }))
   .sort((a, b) => b.media - a.media);

  const stileInput = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1.5px solid #4a3f35", borderRadius: 8,
    padding: "10px 14px", color: "#f0e8d8", fontSize: 14,
    fontFamily: "'Lora', serif", outline: "none", boxSizing: "border-box",
  };

  const tabs = [
    { id: "nuova", label: "✍️ Valuta" },
    { id: "classifica", label: "🏆 Classifica" },
    { id: "mie", label: `📋 Mie (${mieValutazioni.length})` },
    ...(isAdmin ? [{ id: "admin", label: "🛡 Admin" }] : []),
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1410",
      backgroundImage: "radial-gradient(ellipse at 20% 0%, rgba(200,168,75,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(160,120,48,0.06) 0%, transparent 60%)",
      fontFamily: "'Lora', serif", color: "#f0e8d8", padding: "0 0 40px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "24px 24px 14px", textAlign: "center", borderBottom: "1px solid rgba(200,168,75,0.15)", marginBottom: 18 }}>
        <div style={{ fontSize: 30, marginBottom: 2 }}>🍰</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: "#c8a84b", margin: 0 }}>Tiramisù Judge</h1>
        <div style={{ fontSize: 12, color: "#8a7a6a", marginTop: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ color: isAdmin ? "#c8764b" : "#c8a84b" }}>
            {isAdmin ? "🛡" : "✦"} {username}
            {isAdmin && <span style={{ marginLeft: 4, fontSize: 10, background: "rgba(199,118,75,0.2)", color: "#c8764b", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }}>ADMIN</span>}
          </span>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#6a6a5a", fontSize: 11, cursor: "pointer", textDecoration: "underline", fontFamily: "'Lora', serif" }}>esci</button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 5, marginBottom: 22, padding: "0 16px" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setSchermata(tab.id)} style={{
            flex: 1, padding: "8px 3px", borderRadius: 9,
            border: schermata === tab.id
              ? `1.5px solid ${tab.id === "admin" ? "#c8764b" : "#c8a84b"}`
              : "1.5px solid rgba(200,168,75,0.2)",
            background: schermata === tab.id
              ? (tab.id === "admin" ? "rgba(199,118,75,0.12)" : "rgba(200,168,75,0.12)")
              : "transparent",
            color: schermata === tab.id ? (tab.id === "admin" ? "#c8764b" : "#c8a84b") : "#8a7a6a",
            fontFamily: "'Lora', serif", fontSize: 11, cursor: "pointer",
            fontWeight: schermata === tab.id ? 600 : 400,
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* ── NUOVA VALUTAZIONE ── */}
        {schermata === "nuova" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <input placeholder="Nome del tiramisù o del locale..." value={nome} onChange={(e) => setNome(e.target.value)} style={stileInput} />
              <input placeholder="Dove l'hai assaggiato?" value={luogo} onChange={(e) => setLuogo(e.target.value)} style={stileInput} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#8a7a6a", marginBottom: 8 }}>📍 Posizione</div>
              <button onClick={handleGeo} style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                border: `1.5px solid ${geoStatus === "ok" ? "#8fb87a" : "#c8a84b"}40`,
                background: "rgba(255,255,255,0.03)",
                color: geoStatus === "ok" ? "#8fb87a" : geoStatus === "error" ? "#c47a7a" : "#c8a84b",
                fontFamily: "'Lora', serif", fontSize: 13, cursor: "pointer", textAlign: "left",
              }}>
                {geoStatus === "loading" && "⏳ Rilevamento..."}
                {geoStatus === "ok" && `✅ Posizione salvata (${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)})`}
                {geoStatus === "error" && "❌ Geolocalizzazione non disponibile"}
                {geoStatus === "idle" && "📍 Rileva posizione attuale"}
              </button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#8a7a6a", marginBottom: 8 }}>📸 Foto</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => cameraInputRef.current.click()} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid rgba(200,168,75,0.3)", background: "rgba(255,255,255,0.03)", color: "#c8a84b", fontFamily: "'Lora', serif", fontSize: 13, cursor: "pointer" }}>📷 Fotocamera</button>
                <button onClick={() => fileInputRef.current.click()} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid rgba(200,168,75,0.3)", background: "rgba(255,255,255,0.03)", color: "#c8a84b", fontFamily: "'Lora', serif", fontSize: 13, cursor: "pointer" }}>🖼 Galleria</button>
              </div>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: "none" }} />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
              {foto && (
                <div style={{ marginTop: 10, position: "relative" }}>
                  <img src={foto} alt="anteprima" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(200,168,75,0.3)" }} />
                  <button onClick={() => setFoto(null)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 24 }}>
              {CRITERI.map((c) => (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: "#d0c0a8", fontWeight: 500 }}>{c.emoji} {c.label}</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: voti[c.id] > 0 ? "#c8a84b" : "#4a3f35", minWidth: 24, textAlign: "right" }}>
                      {voti[c.id] > 0 ? voti[c.id] : "—"}
                    </span>
                  </div>
                  <VotoInput value={voti[c.id]} onChange={(v) => setVoti((prev) => ({ ...prev, [c.id]: v }))} />
                </div>
              ))}
            </div>
            {media && (
              <div style={{ background: "rgba(200,168,75,0.08)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: 12, padding: "14px 20px", textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 900, color: giudizio.colore, lineHeight: 1 }}>{media}</div>
                <div style={{ fontSize: 14, color: giudizio.colore, marginTop: 4 }}>{giudizio.testo}</div>
              </div>
            )}
            <textarea placeholder="Note e impressioni (facoltativo)..." value={note} onChange={(e) => setNote(e.target.value)} rows={3} style={{ ...stileInput, resize: "vertical", marginBottom: 16 }} />
            <button onClick={handleSalva} disabled={!media || salvato} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: salvato ? "#8fb87a" : media ? "linear-gradient(135deg, #c8a84b, #a07830)" : "#3a322a",
              color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 16,
              fontWeight: 700, cursor: media && !salvato ? "pointer" : "default", transition: "all 0.3s",
            }}>
              {salvato ? "✓ Salvato!" : "Salva Valutazione"}
            </button>
          </div>
        )}

        {/* ── CLASSIFICA ── */}
        {schermata === "classifica" && (
          <div>
            {loadingDati ? (
              <div style={{ textAlign: "center", padding: 40, color: "#8a7a6a" }}>⏳ Caricamento...</div>
            ) : tutte.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#8a7a6a" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍰</div>
                <div style={{ fontStyle: "italic", fontSize: 14 }}>Nessuna valutazione ancora. Sii il primo!</div>
              </div>
            ) : (
              <>
                <div style={{ background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                  {[
                    { label: "Valutazioni", val: tutte.length },
                    { label: "Giudici", val: statsPerUtente.length },
                    { label: "Media globale", val: (tutte.reduce((a, t) => a + (t.media || 0), 0) / tutte.length).toFixed(1) },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#c8a84b", fontWeight: 700 }}>{item.val}</div>
                      <div style={{ fontSize: 11, color: "#8a7a6a" }}>{item.label}</div>
                    </div>
                  ))}
                </div>
                {statsPerUtente.length > 1 && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(200,168,75,0.12)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: "#8a7a6a", marginBottom: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>🏅 Classifica Giudici</div>
                    {statsPerUtente.slice(0, 5).map((u, i) => (
                      <div key={u.username} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < Math.min(statsPerUtente.length, 5) - 1 ? "1px solid rgba(200,168,75,0.08)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14 }}>{["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]}</span>
                          <span style={{ fontSize: 13, color: "#d0c0a8" }}>{u.username}</span>
                        </div>
                        <div>
                          <span style={{ fontFamily: "'Playfair Display', serif", color: "#c8a84b", fontWeight: 700, fontSize: 15 }}>{u.media}</span>
                          <span style={{ fontSize: 11, color: "#8a7a6a", marginLeft: 6 }}>({u.count} 🍰)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 12, color: "#8a7a6a", marginBottom: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>📋 Ultime valutazioni</div>
                {tutte.map((t) => (
                  <TiramisuCard key={t.id} tiramisu={t} isOwn={t.user_id === session.user.id} isAdmin={isAdmin} onDelete={handleDelete} />
                ))}
              </>
            )}
          </div>
        )}

        {/* ── LE MIE ── */}
        {schermata === "mie" && (
          <div>
            {mieValutazioni.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#8a7a6a" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍰</div>
                <div style={{ fontStyle: "italic", fontSize: 14 }}>Non hai ancora valutato nessun tiramisù!</div>
                <button onClick={() => setSchermata("nuova")} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "1.5px solid #c8a84b", background: "transparent", color: "#c8a84b", fontFamily: "'Lora', serif", fontSize: 14, cursor: "pointer" }}>✍️ Nuova Valutazione</button>
              </div>
            ) : (
              <>
                <div style={{ background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                  {[
                    { label: "Assaggiati", val: mieValutazioni.length },
                    { label: "Media", val: (mieValutazioni.reduce((a, t) => a + (t.media || 0), 0) / mieValutazioni.length).toFixed(1) },
                    { label: "Il migliore", val: Math.max(...mieValutazioni.map((t) => t.media || 0)).toFixed(1) },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#c8a84b", fontWeight: 700 }}>{item.val}</div>
                      <div style={{ fontSize: 11, color: "#8a7a6a" }}>{item.label}</div>
                    </div>
                  ))}
                </div>
                {mieValutazioni.map((t) => (
                  <TiramisuCard key={t.id} tiramisu={t} isOwn={true} isAdmin={isAdmin} onDelete={handleDelete} />
                ))}
              </>
            )}
          </div>
        )}

        {/* ── ADMIN ── */}
        {schermata === "admin" && isAdmin && (
          <div>
            <div style={{ background: "rgba(199,118,75,0.06)", border: "1px solid rgba(199,118,75,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#c8764b" }}>
              🛡 Pannello amministratore — accesso completo
            </div>
            <AdminPanel utenti={utenti} valutazioni={tutte} onToggleAdmin={handleToggleAdmin} onDeleteUser={handleDeleteUser} currentUserId={session.user.id} />
          </div>
        )}
      </div>
    </div>
  );
}
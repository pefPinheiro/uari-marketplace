'use client';

import React, { useEffect, useState } from 'react';
import { useLojista } from '../layout-client';
import { lojistaService } from '../../services/lojista';

// Opções de horários de meia em meia hora para os seletores
const TIME_OPTIONS = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30',
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export default function ConfigPage() {
  const { store, refreshData } = useLojista();

  // Estados de Identidade Visual
  const [slogan, setSlogan] = useState('Quebra essa castanha');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=300');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200');

  // Estados de Logística & Entrega
  const [retirada, setRetirada] = useState(true);
  const [delivery, setDelivery] = useState(true);

  // Estados de Horários de Funcionamento conforme o mockup
  const [hours, setHours] = useState<any>({
    segunda: { active: true, open: '08:00', close: '18:00' },
    terca: { active: true, open: '08:00', close: '18:00' },
    quarta: { active: true, open: '08:00', close: '18:00' },
    quinta: { active: true, open: '08:00', close: '18:00' },
    sexta: { active: true, open: '08:00', close: '18:00' },
    sabado: { active: true, open: '08:00', close: '12:00' },
    domingo: { active: false, open: '00:00', close: '00:00' }
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sincroniza dados iniciais do banco de dados (se disponíveis)
  useEffect(() => {
    if (store) {
      setSlogan(store.description || 'Quebra essa castanha');
      if (store.logo_url) setLogoUrl(store.logo_url);
      if (store.banner_url) setBannerUrl(store.banner_url);
      
      const addr = store.address || {};
      if (addr.opening_hours) {
        setHours(addr.opening_hours);
      }
      if (addr.logistics) {
        setRetirada(addr.logistics.retirada ?? true);
        setDelivery(addr.logistics.delivery ?? true);
      }
    }
  }, [store]);

  const handleToggleDay = (day: string) => {
    setHours((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        active: !prev[day].active
      }
    }));
  };

  const handleTimeChange = (day: string, type: 'open' | 'close', value: string) => {
    setHours((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const updatedAddress = {
      ...(store?.address || {}),
      opening_hours: hours,
      logistics: { retirada, delivery }
    };

    try {
      const success = await lojistaService.updateStoreSettings(
        store.id,
        slogan,
        logoUrl,
        bannerUrl,
        updatedAddress
      );

      if (success) {
        setFeedback({ type: 'success', message: 'Configurações da vitrine virtual salvas com sucesso!' });
        await refreshData();
      } else {
        setFeedback({ type: 'error', message: 'Erro ao registrar as alterações no banco de dados.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Ocorreu um erro no processamento das configurações.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const getDayLabel = (day: string) => {
    switch (day) {
      case 'segunda': return 'Segunda-feira';
      case 'terca': return 'Terça-feira';
      case 'quarta': return 'Quarta-feira';
      case 'quinta': return 'Quinta-feira';
      case 'sexta': return 'Sexta-feira';
      case 'sabado': return 'Sábado';
      case 'domingo': return 'Domingo';
      default: return day;
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Top Header Row */}
      <section style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Configurações da Vitrine Virtual</h1>
          <p style={styles.pageSubtitle}>Ajuste a identidade visual, logística de entrega e horários de atendimento de sua loja.</p>
        </div>
      </section>

      {feedback && (
        <div style={{
          ...styles.feedbackBox,
          backgroundColor: feedback.type === 'success' ? 'rgba(26, 115, 18, 0.08)' : 'rgba(186, 26, 26, 0.08)',
          color: feedback.type === 'success' ? 'var(--tertiary)' : 'var(--error)',
          borderColor: feedback.type === 'success' ? 'var(--tertiary)' : 'var(--error)'
        }}>
          {feedback.message}
        </div>
      )}

      {/* Main Form content wrapper */}
      <div style={styles.formContent}>
        
        {/* CARD 1: Identidade Visual */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>palette</span>
            <h2 style={styles.cardTitle}>Identidade Visual</h2>
          </div>

          <div style={styles.visualSetupWrapper}>
            {/* Banner Area */}
            <div style={styles.bannerSetup}>
              <span style={styles.fieldLabel}>Banner de Capa (Recomendado 1200x400)</span>
              <div style={styles.bannerImageContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bannerUrl} alt="Capa da vitrine" style={styles.bannerImage} />
              </div>
            </div>

            {/* Logo Area */}
            <div style={styles.logoSetup}>
              <span style={styles.fieldLabel}>Logo da Loja</span>
              <div style={styles.logoCircleContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo" style={styles.logoImage} />
              </div>
              <span style={styles.logoHelpText}>JPG ou PNG até 2MB</span>
            </div>
          </div>

          {/* Slogan / Frase de boas-vindas */}
          <div style={{ ...styles.formGroup, marginTop: '24px' }}>
            <label style={styles.formLabel}>Frase de Boas-vindas (Slogan)</label>
            <input 
              type="text" 
              value={slogan} 
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Quebra essa castanha"
              style={styles.formInput}
            />
          </div>
        </section>

        {/* CARD 2: Logística e Entrega */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>local_shipping</span>
            <h2 style={styles.cardTitle}>Logística e Entrega</h2>
          </div>

          <div style={styles.logisticsGrid}>
            
            {/* Retirada no Local */}
            <div 
              onClick={() => setRetirada(!retirada)}
              style={{
                ...styles.logisticCard,
                borderColor: retirada ? 'var(--primary)' : 'var(--surface-container-highest)',
                backgroundColor: retirada ? 'rgba(110, 0, 193, 0.02)' : 'var(--surface-container-lowest)'
              }}
            >
              <div style={styles.logisticLeft}>
                <div style={{ ...styles.logisticIconBg, backgroundColor: 'rgba(110, 0, 193, 0.08)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>storefront</span>
                </div>
                <div style={styles.logisticTexts}>
                  <span style={styles.logisticTitle}>Retirada no Local</span>
                  <span style={styles.logisticDesc}>Permite que o cliente busque o pedido na loja</span>
                </div>
              </div>
              <div style={{
                ...styles.checkboxCustom,
                backgroundColor: retirada ? 'var(--primary)' : 'transparent',
                borderColor: retirada ? 'var(--primary)' : 'var(--outline-variant)'
              }}>
                {retirada && <span className="material-symbols-outlined" style={styles.checkIcon}>check</span>}
              </div>
            </div>

            {/* Delivery Próprio */}
            <div 
              onClick={() => setDelivery(!delivery)}
              style={{
                ...styles.logisticCard,
                borderColor: delivery ? 'var(--primary)' : 'var(--surface-container-highest)',
                backgroundColor: delivery ? 'rgba(110, 0, 193, 0.02)' : 'var(--surface-container-lowest)'
              }}
            >
              <div style={styles.logisticLeft}>
                <div style={{ ...styles.logisticIconBg, backgroundColor: 'rgba(254, 107, 0, 0.08)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '22px' }}>moped</span>
                </div>
                <div style={styles.logisticTexts}>
                  <span style={styles.logisticTitle}>Delivery Próprio</span>
                  <span style={styles.logisticDesc}>Você realiza as entregas com sua equipe</span>
                </div>
              </div>
              <div style={{
                ...styles.checkboxCustom,
                backgroundColor: delivery ? 'var(--primary)' : 'transparent',
                borderColor: delivery ? 'var(--primary)' : 'var(--outline-variant)'
              }}>
                {delivery && <span className="material-symbols-outlined" style={styles.checkIcon}>check</span>}
              </div>
            </div>

          </div>
        </section>

        {/* CARD 3: Horários de Funcionamento */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>schedule</span>
            <h2 style={styles.cardTitle}>Horários de Funcionamento</h2>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Dia da Semana</th>
                  <th style={styles.th}>Abertura</th>
                  <th style={styles.th}>Fechamento</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(hours).map((day) => {
                  const config = hours[day];
                  return (
                    <tr key={day} style={styles.tr}>
                      {/* Nome do dia */}
                      <td style={{ ...styles.td, fontWeight: '700' }}>{getDayLabel(day)}</td>
                      
                      {/* Abertura dropdown */}
                      <td style={styles.td}>
                        <div style={styles.selectWrapper}>
                          <select
                            value={config.open}
                            disabled={!config.active}
                            onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                            style={{
                              ...styles.selectInput,
                              opacity: config.active ? 1 : 0.5
                            }}
                          >
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="material-symbols-outlined" style={styles.selectClockIcon}>schedule</span>
                        </div>
                      </td>

                      {/* Fechamento dropdown */}
                      <td style={styles.td}>
                        <div style={styles.selectWrapper}>
                          <select
                            value={config.close}
                            disabled={!config.active}
                            onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                            style={{
                              ...styles.selectInput,
                              opacity: config.active ? 1 : 0.5
                            }}
                          >
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="material-symbols-outlined" style={styles.selectClockIcon}>schedule</span>
                        </div>
                      </td>

                      {/* Status toggle switch */}
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.toggleRowContainer} onClick={() => handleToggleDay(day)}>
                          <span style={{
                            ...styles.toggleLabelText,
                            color: config.active ? 'var(--tertiary)' : 'var(--error)'
                          }}>
                            {config.active ? 'Aberto' : 'Fechado'}
                          </span>
                          <div style={{
                            ...styles.toggleSwitchBg,
                            backgroundColor: config.active ? 'var(--primary)' : 'var(--outline-variant)'
                          }}>
                            <div style={{
                              ...styles.toggleSwitchCircle,
                              transform: config.active ? 'translateX(20px)' : 'translateX(0px)'
                            }} />
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Footer Form Action Buttons exactly like Figma mockup */}
      <footer style={styles.footerRow}>
        <button 
          type="button" 
          onClick={() => {
            if (store) {
              setSlogan(store.description || 'Quebra essa castanha');
              if (store.logo_url) setLogoUrl(store.logo_url);
              if (store.banner_url) setBannerUrl(store.banner_url);
              
              const addr = store.address || {};
              if (addr.opening_hours) setHours(addr.opening_hours);
              if (addr.logistics) {
                setRetirada(addr.logistics.retirada ?? true);
                setDelivery(addr.logistics.delivery ?? true);
              }
              alert('Alterações descartadas!');
            }
          }}
          style={styles.discardBtn}
        >
          Descartar
        </button>
        <button 
          onClick={() => handleSaveSettings()}
          style={styles.saveBtn}
          disabled={submitting}
        >
          {submitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </footer>

    </div>
  );
}

// Estilos premium inline idênticos aos mockups de alta fidelidade fornecidos
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '8px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--primary)',
    fontFamily: 'Plus Jakarta Sans',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: 'var(--on-surface-variant)',
    marginTop: '4px',
  },
  feedbackBox: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '14px',
    fontWeight: '700',
  },
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.03)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid var(--surface-container-highest)',
    paddingBottom: '12px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
  },
  visualSetupWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '24px',
    alignItems: 'start',
  },
  bannerSetup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--outline)',
  },
  bannerImageContainer: {
    width: '100%',
    height: '220px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--surface-container-highest)',
    backgroundColor: 'var(--surface-container-low)',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logoSetup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  logoCircleContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '4px solid var(--surface-container-low)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logoHelpText: {
    fontSize: '11px',
    color: 'var(--outline)',
    fontWeight: '600',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '750',
    color: 'var(--on-surface)',
  },
  formInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  logisticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  logisticCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  logisticLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logisticIconBg: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logisticTexts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  logisticTitle: {
    fontSize: '15px',
    fontWeight: '750',
    color: 'var(--on-surface)',
  },
  logisticDesc: {
    fontSize: '12px',
    color: 'var(--outline)',
    fontWeight: '600',
  },
  checkboxCustom: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    borderBottom: '1px solid var(--surface-container-highest)',
  },
  th: {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--outline)',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid var(--surface-container-highest)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--on-surface)',
    verticalAlign: 'middle',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '130px',
  },
  selectInput: {
    width: '100%',
    padding: '8px 12px 8px 36px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    backgroundColor: 'var(--surface-container-low)',
    fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
  },
  selectClockIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '16px',
    color: 'var(--outline)',
    pointerEvents: 'none',
  },
  toggleRowContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  toggleLabelText: {
    fontSize: '14px',
    fontWeight: '700',
  },
  toggleSwitchBg: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    padding: '2px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
  },
  toggleSwitchCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    transition: 'transform 0.2s ease-in-out',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '24px',
    marginTop: '12px',
    paddingTop: '16px',
  },
  discardBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--outline)',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Plus Jakarta Sans',
    padding: '10px 20px',
    transition: 'all 0.2s',
  },
  saveBtn: {
    backgroundColor: 'var(--secondary-container)', // Laranja vibrante #fe6b00 do mockup
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px', // Cápsula arredondada do mockup
    padding: '14px 42px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(254, 107, 0, 0.15)',
    transition: 'all 0.2s',
    fontFamily: 'Plus Jakarta Sans',
  }
};

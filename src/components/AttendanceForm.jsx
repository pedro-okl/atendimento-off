import { useState } from 'react';
import { CalendarClock, FileText, PenLine, Save, UserRound, Hash, Phone } from 'lucide-react';
import { toDateTimeLocalValue } from '../utils/date';
import { formatCPF, isValidCPF, formatPhoneNumber } from '../utils/cpf';

const tiposProblema = [
  'Saúde',
  'Financeiro',
  'Habitação',
  'Educação',
  'Alimentação',
  'Segurança',
  'Saúde mental',
  'Acesso a direitos',
  'Documentação',
  'Outro'
];

const initialForm = {
  nomeAtendido: '',
  idade: '',
  tipoProblema: '',
  cpf: '',
  contato: '',
  descricao: '',
  atendimentoEm: toDateTimeLocalValue()
};

export function AttendanceForm({ onAdd }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.nomeAtendido.trim() || !form.idade.trim() || !form.tipoProblema || !form.cpf.trim() || !form.contato.trim() || !form.descricao.trim()) {
      setError('Informe todos os campos obrigatórios.');
      return;
    }

    if (!isValidCPF(form.cpf)) {
      setError('CPF inválido.');
      return;
    }

    try {
      setSaving(true);
      await onAdd({
        nomeAtendido: form.nomeAtendido,
        idade: parseInt(form.idade),
        tipoProblema: form.tipoProblema,
        cpf: form.cpf.replace(/\D/g, ''),
        contato: form.contato,
        descricao: form.descricao,
        atendimentoEm: new Date(form.atendimentoEm).toISOString()
      });

      setForm({
        nomeAtendido: '',
        idade: '',
        tipoProblema: '',
        cpf: '',
        contato: '',
        descricao: '',
        atendimentoEm: toDateTimeLocalValue()
      });
      setSaved(true);
    } catch (submitError) {
      setError(submitError.message || 'Nao foi possivel guardar este atendimento agora.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-panel" aria-labelledby="form-title">
      <div className="section-title">
        <span className="section-glyph" aria-hidden="true">
          <PenLine size={17} />
        </span>
        <h2 id="form-title">Novo atendimento</h2>
      </div>

      <form onSubmit={handleSubmit} className="attendance-form">
        <label>
          <span>
            <UserRound size={16} aria-hidden="true" />
            Nome do atendido
          </span>
          <input
            type="text"
            value={form.nomeAtendido}
            onChange={(event) => updateField('nomeAtendido', event.target.value)}
            autoComplete="name"
            maxLength={120}
            required
          />
        </label>

        <label>
          <span>
            <Hash size={16} aria-hidden="true" />
            Idade
          </span>
          <input
            type="number"
            value={form.idade}
            onChange={(event) => updateField('idade', event.target.value)}
            min="0"
            max="150"
            required
          />
        </label>

        <label>
          <span>
            <FileText size={16} aria-hidden="true" />
            Tipo de problema
          </span>
          <select
            value={form.tipoProblema}
            onChange={(event) => updateField('tipoProblema', event.target.value)}
            required
          >
            <option value="">Selecione um tipo de problema</option>
            {tiposProblema.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>
            <Hash size={16} aria-hidden="true" />
            CPF
          </span>
          <input
            type="text"
            value={form.cpf}
            onChange={(event) => updateField('cpf', formatCPF(event.target.value))}
            placeholder="000.000.000-00"
            maxLength={14}
            required
          />
        </label>

        <label>
          <span>
            <Phone size={16} aria-hidden="true" />
            Contato (telefone ou email)
          </span>
          <input
            type="text"
            value={form.contato}
            onChange={(event) => {
              const value = event.target.value;
              // Se começar com parêntese, é telefone - formata
              if (value.includes('(') || value.match(/^\d{2}/)) {
                updateField('contato', formatPhoneNumber(value));
              } else {
                // Senão, é email - deixa como está
                updateField('contato', value);
              }
            }}
            placeholder="(11) 99999-9999 ou email@example.com"
            maxLength={120}
            required
          />
        </label>

        <label>
          <span>
            <CalendarClock size={16} aria-hidden="true" />
            Data e hora
          </span>
          <input
            type="datetime-local"
            value={form.atendimentoEm}
            onChange={(event) => updateField('atendimentoEm', event.target.value)}
            required
          />
        </label>

        <label>
          <span>
            <FileText size={16} aria-hidden="true" />
            Descricao
          </span>
          <textarea
            value={form.descricao}
            onChange={(event) => updateField('descricao', event.target.value)}
            rows={4}
            maxLength={700}
            required
          />
        </label>

        {error ? <p className="form-message error-message">{error}</p> : null}
        {saved ? (
          <p className="form-message success-message">
            Atendimento guardado neste aparelho. Ele sera sincronizado quando houver conexao.
          </p>
        ) : null}

        <button type="submit" className="primary-button" disabled={saving}>
          <Save size={18} aria-hidden="true" />
          <span>{saving ? 'Guardando...' : 'Guardar atendimento'}</span>
        </button>
      </form>
    </section>
  );
}

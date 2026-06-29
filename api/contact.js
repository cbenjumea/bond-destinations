export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }


  const { name, email, phone, duration, style, destinations, accommodation } = req.body;

  const destList = Array.isArray(destinations)
    ? destinations.join(', ')
    : destinations || '—';

  const row = (label, value, shaded) =>
    `<tr style="${shaded ? 'background:#f4f1eb;' : ''}">
      <td style="padding:10px 16px;color:#666;width:160px;font-size:13px;vertical-align:top">${label}</td>
      <td style="padding:10px 16px;font-weight:500;font-size:13px">${value || '—'}</td>
    </tr>`;

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2ddd4;">
      <div style="background:#0d0d0d;padding:24px 28px;">
        <p style="color:#c9a84c;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;margin:0 0 6px">Q Branch · Secure Channel</p>
        <h1 style="color:#f5f0e8;font-size:22px;font-weight:300;margin:0">New Mission Enquiry</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff">
        ${row('Name',          name)}
        ${row('Email',         email,         true)}
        ${row('Phone',         phone)}
        ${row('Duration',      duration,      true)}
        ${row('Style',         style)}
        ${row('Destinations',  destList,      true)}
        ${row('Accommodation', accommodation)}
      </table>
      <div style="padding:16px 28px;background:#f9f7f2;border-top:1px solid #e2ddd4;">
        <p style="margin:0;font-size:11px;color:#999">Submitted via bond-destinations.vercel.app</p>
      </div>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Q Branch <onboarding@resend.dev>',
        to:   'cbenjumeaulfsparre@gmail.com',
        subject: `New mission — ${name || 'Agent'} · ${destList}`,
        html,
      }),
    });

    if (!r.ok) {
      const err = await r.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: err.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}

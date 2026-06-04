// Función de Netlify — Proxy seguro hacia Anthropic
// La API Key nunca sale del servidor

exports.handler = async (event) => {

  // Solo acepta POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verificar que la API Key existe en las variables de entorno
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API Key no configurada en el servidor.' })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Llamada a Anthropic desde el servidor (segura)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            apiKey,
        'anthropic-version':    '2023-06-01'
      },
      body: JSON.stringify({
        model:      body.model      || 'claude-sonnet-4-20250514',
        max_tokens: body.max_tokens || 600,
        system:     body.system,
        messages:   body.messages
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type':                'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al conectar con Anthropic: ' + err.message })
    };
  }
};

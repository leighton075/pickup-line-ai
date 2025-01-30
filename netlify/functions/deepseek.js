exports.handler = async (event) => {
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    const { message } = JSON.parse(event.body);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'You are a witty pickup line generator.' },
                { role: 'user', content: message }
            ],
            max_tokens: 100,
            temperature: 0.7
        })
    });

    const data = await response.json();
    return {
        statusCode: 200,
        body: JSON.stringify({ response: data.choices[0].message.content })
    };
};

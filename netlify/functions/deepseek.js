exports.handler = async (event) => {
    console.log('🔹 DeepSeek function triggered');
    console.log('📝 Request body:', event.body);

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    console.log('🔑 API Key exists:', !!DEEPSEEK_API_KEY);
    if (DEEPSEEK_API_KEY) {
        console.log('🔑 API Key:', DEEPSEEK_API_KEY);
    } else {
        console.log('Missing api key');
    }
    

    try {
        const { message } = JSON.parse(event.body);
        console.log('💬 User Message:', message);

        console.log('🚀 Sending request to DeepSeek API...');

        // Set a timeout for the API request (e.g., 8 seconds)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

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
            }),
            signal: controller.signal // Attach the timeout signal
        });

        clearTimeout(timeout); // Clear timeout if response comes back in time

        console.log('📩 API Response received');
        console.log('🔍 Status:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        // Check if the response body is empty before parsing
        const responseBody = await response.text(); // Use text() to avoid JSON parsing issues
        if (!responseBody) {
            throw new Error('Empty response body received from API');
        }

        let data;
        try {
            data = JSON.parse(responseBody); // Parse response if body exists
        } catch (error) {
            throw new Error('Error parsing JSON response from API');
        }

        console.log('📝 Full API Response:', JSON.stringify(data, null, 2));

        const botMessage = data.choices?.[0]?.message?.content;
        if (!botMessage) {
            throw new Error('Invalid API response structure');
        }

        console.log('🤖 Bot Response:', botMessage);

        return {
            statusCode: 200,
            body: JSON.stringify({ response: botMessage })
        };
    } catch (error) {
        console.error('❌ Error:', error);

        if (error.name === 'AbortError') {
            console.error('🕒 API request timed out!');
            return {
                statusCode: 504,
                body: JSON.stringify({ error: 'API request timed out. Please try again.' })
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
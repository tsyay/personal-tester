// src/components/YandexGPTForm.js
import React, { useState } from 'react';
import axios from 'axios';
import './YandexGPTForm.css';

function YandexGPTForm() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/generate-text/', { prompt });
      setResponse(res.data.response);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="yandex-gpt-form">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Введите ваш запрос"
        />
        <button type="submit">Отправить</button>
      </form>
      {response && <div className="response">{response}</div>}
    </div>
  );
}

export default YandexGPTForm;
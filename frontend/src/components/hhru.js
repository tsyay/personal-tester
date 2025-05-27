import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HHru = () => {
  const [areas, setAreas] = useState([]);
  const [city, setCity] = useState("");
  const [foundCity, setFoundCity] = useState(null);

  useEffect(() => {
    // Загружаем список регионов
    axios.get('/get_areas/')
      .then(response => {
        setAreas(response.data.areas);
      })
      .catch(error => {
        console.error('Error fetching areas:', error);
      });
  }, []);       

  const handleCitySearch = () => {
    if (city.trim() === "") return;
    
    const result = findCity(city, areas);
    setFoundCity(result);
  };

  function findCity(cityName, data) {
    // Сначала ищем точное совпадение
    const exactMatch = findExactMatch(cityName, data);
    if (exactMatch) return exactMatch;

    // Если точного совпадения нет, ищем частичное
    return findPartialMatch(cityName, data);
  }

  function findExactMatch(cityName, data) {
    for (const region of data) {
      if (region.areas && Array.isArray(region.areas)) {
        // Проверяем точное совпадение в текущем регионе
        const foundCity = region.areas.find(area => 
          area.name.toLowerCase() === cityName.toLowerCase()
        );
        
        if (foundCity) {
          return {
            city: foundCity,
            region: {
              id: region.id,
              name: region.name
            }
          };
        }
        
        // Рекурсивно проверяем вложенные области
        for (const area of region.areas) {
          if (area.areas && Array.isArray(area.areas)) {
            const foundInSubarea = findExactMatch(cityName, [area]);
            if (foundInSubarea) return foundInSubarea;
          }
        }
      }
    }
    return null;
  }

  function findPartialMatch(cityName, data) {
    for (const region of data) {
      if (region.areas && Array.isArray(region.areas)) {
        // Проверяем частичное совпадение в текущем регионе
        const foundCity = region.areas.find(area => 
          area.name.toLowerCase().includes(cityName.toLowerCase())
        );
        
        if (foundCity) {
          return {
            city: foundCity,
            region: {
              id: region.id,
              name: region.name
            }
          };
        }
        
        // Рекурсивно проверяем вложенные области
        for (const area of region.areas) {
          if (area.areas && Array.isArray(area.areas)) {
            const foundInSubarea = findPartialMatch(cityName, [area]);
            if (foundInSubarea) return foundInSubarea;
          }
        }
      }
    }
    return null;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3>Поиск города</h3>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Введите название города или региона"
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={handleCitySearch} style={{ padding: '8px 16px' }}>
          Поиск города
        </button>
      </div>
      
      {foundCity ? (
        <div>
          <p>Найден город:</p>
          <p>ID: {foundCity.city.id}</p>
          <p>Название: {foundCity.city.name}</p>
          <p>Регион: {foundCity.region.name}</p>
        </div>
      ) : city ? (
        <p>Город не найден</p>
      ) : null}
    </div>
  );
};

export default HHru;
  


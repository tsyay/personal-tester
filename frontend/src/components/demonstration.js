import React, { useState, useEffect } from "react";
import '../styles/demonstration.css';


const Demonstration = () => {
    const [selectedTab, setSelectedTab] = useState('developer');
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        const timeout = setTimeout(() => setIsAnimating(false), 400); // длительность анимации в ms
        return () => clearTimeout(timeout);
    }, [selectedTab]);

    const demoData = {
        developer: {
          title: "Python разработчик",
          description: "Анализ 1,245 вакансий за последние 30 дней",
          location: "Москва",
          jobCount: 1245,
          salary: {
            min: 120000,
            max: 350000,
            median: 220000,
            currency: "₽"
          },
          skills: [
            { name: "Python", percentage: 100, isHighDemand: true },
            { name: "SQL", percentage: 85, isHighDemand: true },
            { name: "Django", percentage: 65, isHighDemand: false },
            { name: "Docker", percentage: 58, isHighDemand: true },
            { name: "Flask", percentage: 42, isHighDemand: false },
            { name: "FastAPI", percentage: 38, isHighDemand: true },
          ]
        },
        analyst: {
          title: "Аналитик данных",
          description: "Анализ 876 вакансий за последние 30 дней",
          location: "Москва",
          jobCount: 876,
          salary: {
            min: 100000,
            max: 280000,
            median: 180000,
            currency: "₽"
          },
          skills: [
            { name: "SQL", percentage: 95, isHighDemand: true },
            { name: "Excel", percentage: 90, isHighDemand: true },
            { name: "Python", percentage: 75, isHighDemand: true },
            { name: "Power BI", percentage: 60, isHighDemand: true },
            { name: "Tableau", percentage: 48, isHighDemand: false },
            { name: "R", percentage: 30, isHighDemand: false },
          ]
        },
        manager: {
          title: "Продукт-менеджер",
          description: "Анализ 543 вакансий за последние 30 дней",
          location: "Москва",
          jobCount: 543,
          salary: {
            min: 150000,
            max: 400000,
            median: 250000,
            currency: "₽"
          },
          skills: [
            { name: "Управление продуктом", percentage: 100, isHighDemand: true },
            { name: "Agile/Scrum", percentage: 85, isHighDemand: true },
            { name: "Проведение исследований", percentage: 75, isHighDemand: false },
            { name: "Английский язык", percentage: 70, isHighDemand: true },
            { name: "Аналитика", percentage: 65, isHighDemand: true },
            { name: "Прототипирование", percentage: 50, isHighDemand: false },
          ]
        }
      };
    
    return (
        <section className="demo">  
            <div className="demo-container">
                <div className="demo-title"><h3>Пример <span className="gradient-text">AI-анализа требований</span></h3></div>
                <div className="demo-subtitle"><p>Изучите демо-отчеты по требованиям работодателей в разных профессиональных областях</p></div>

                <div className="tabs-container">
                    <div className="tabs-trigger-container">
                        <button 
                            className={`tabs-trigger${selectedTab === 'developer' ? ' selected' : ''}`}
                            onClick={() => setSelectedTab('developer')}
                        >
                            {demoData.developer.title}
                        </button>
                        <button 
                            className={`tabs-trigger${selectedTab === 'analyst' ? ' selected' : ''}`}
                            onClick={() => setSelectedTab('analyst')}
                        >
                            {demoData.analyst.title}
                        </button>
                        <button 
                            className={`tabs-trigger${selectedTab === 'manager' ? ' selected' : ''}`}
                            onClick={() => setSelectedTab('manager')}
                        >
                            {demoData.manager.title}
                        </button>
                    </div>
                    <div className="tabs-content-header">
                        <h4>{demoData[selectedTab].title}</h4>
                        <p>{demoData[selectedTab].description}</p>
                        <p className="badge">{demoData[selectedTab].location}</p>
                    </div>
                    <div className={`tabs-content${isAnimating ? ' fade-in' : ''}`}>
                        <p>Диапазон зарплат</p>
                        <p className="tabs-salary">{demoData[selectedTab].salary.median} <span className="tabs-salary-small">{demoData[selectedTab].salary.min} - {demoData[selectedTab].salary.max}</span> {demoData[selectedTab].salary.currency}</p>
                        <p>Требуемые навыки</p>
                        {demoData[selectedTab].skills.map((skill, idx) => (
                            <div className="skill" key={skill.name + idx}>
                                <div className="row"> 
                                    <h3>{skill.name}</h3>
                                    { skill.isHighDemand && 
                                        <div className="skill-badge"><p>Высокий спрос</p></div>
                                    }
                                </div>
                                <progress max={100} value={skill.percentage}></progress>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}    

export default Demonstration;
import React from 'react';
import searchLogo from '../assets/logo/search-2.png';
import filterLogo from '../assets/logo/filter.png';
import gearLogo from '../assets/logo/gear.png';
import statsLogo from '../assets/logo/stats.png';
import trendLogo from '../assets/logo/trend.png';
import bookLogo from '../assets/logo/trend.png';

import '../styles/features.css';

const Features = () => {
    const features = [
        {
          icon: searchLogo,
          title: "Анализ вакансий",
          description: "Автоматический анализ требований и условий в сотнях тысяч вакансий с разных площадок."
        },
        {
          icon: statsLogo,
          title: "Статистика навыков",
          description: "Точные данные о востребованности конкретных навыков, технологий и квалификаций на рынке труда."
        },
        {
          icon: trendLogo,
          title: "Тренды рынка",
          description: "Отслеживание динамики изменения требований работодателей и прогнозирование будущих тенденций."
        },
        {
          icon: filterLogo,
          title: "Умная фильтрация",
          description: "Детальная сегментация данных по отраслям, регионам, уровню позиций и другим параметрам."
        },
        {
          icon: bookLogo,
          title: "Рекомендации по обучению",
          description: "Персонализированные советы по развитию навыков на основе текущих требований рынка."
        },
        {
          icon: gearLogo,
          title: "Интеграция с HR-системами",
          description: "API и готовые решения для интеграции с популярными HR-платформами и ATS."
        }
      ];

    return (
        <section className='features'>
            <div className='features-container'>
                <div className='features-title'><h2>Возможности <span className='gradient-text'>нейросетевого анализа</span></h2></div>
                <div className='features-subtitle'>Наши алгоритмы обрабатывают миллионы вакансий для выявления ключевых требований и трендов на рынке труда</div>
                <div className='features-grid'>
                    {features.map((feature, index) => (
                        <div className='feature-card'> 
                            <div className='feature-card-header'>
                                <img src={feature.icon} />
                                <h3>{feature.title}</h3>
                            </div>
                            <div className='feature-card-body'>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
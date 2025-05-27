import React from 'react';
import searchLogo from '../assets/logo/search.png';
import '../styles/hero.css';

const Hero = () => {
    return (
        <section className='hero'>
            <div className='hero-container'> 
                <div className='tag'>
                    <p>Нейросети для поиска и обучения</p>
                </div>
                <div className='hero-heading'>
                    <h1>Анализ требований работодателей <span className='gradient'>искусственным интеллектом</span></h1>
                </div>
                <div className='hero-subtitle'>
                    <h3>Платформа для глубокого анализа рынка труда, навыков и требований по вакансиям с помощью нейросетей.</h3>
                </div>
                <div className='cta-buttons'>
                    <a className='cta-button gradient-link' href='#' >Попробовать бесплатно</a>
                    <a className='cta-button' href='#' >Узнать больше</a>
                </div>
                <form className='prompt-form'>
                    <img src={searchLogo}/>
                    <input type='text' placeholder={'Москва, Python разработчик'}></input>
                    <button type='submit'>Анализировать</button>
                </form>
            </div>
        </section>
    )
}

export default Hero;
import React from 'react';
import { BookOpen, Clock, Award, ChevronRight } from 'lucide-react';

const Learning = () => {
  return (
    <div className="py-12">
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Панель обучения</h1>

        {/* Course Progress */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Текущий курс</h2>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <BookOpen className="icon text-primary-500" />
                <div>
                  <h3 className="text-xl font-semibold">Продвинутая безопасность пищевых продуктов</h3>
                  <p className="text-gray-600">Модуль 3: Хранение и обработка продуктов</p>
                </div>
              </div>
              <button className="btn btn-primary">Продолжить обучение</button>
            </div>
            <div className="progress-bar mb-4">
              <div className="progress-bar-fill" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>65% завершено</span>
              <span>Осталось 2 часа</span>
            </div>
          </div>
        </section>

        {/* Available Courses */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Доступные курсы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <BookOpen className="icon text-primary-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Основы винного сервиса</h3>
                  <p className="text-gray-600">4 модуля • 6 часов</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Изучите основы винного сервиса и сочетания вин</p>
              <button className="btn btn-primary w-full">Начать курс</button>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="icon text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Управление временем</h3>
                  <p className="text-gray-600">3 модуля • 4 часа</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Освойте эффективное управление временем в ресторане</p>
              <button className="btn btn-primary w-full">Начать курс</button>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Award className="icon text-primary-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Превосходное обслуживание</h3>
                  <p className="text-gray-600">5 модулей • 8 часов</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Развивайте исключительные навыки обслуживания</p>
              <button className="btn btn-primary w-full">Начать курс</button>
            </div>
          </div>
        </section>

        {/* Learning Path */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Ваш путь обучения</h2>
          <div className="card p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <BookOpen className="icon text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">Основы безопасности пищевых продуктов</h3>
                  <p className="text-gray-600">Завершено • 100%</p>
                </div>
                <ChevronRight className="icon text-gray-400" />
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <BookOpen className="icon text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">Продвинутая безопасность пищевых продуктов</h3>
                  <p className="text-gray-600">В процессе • 65%</p>
                </div>
                <ChevronRight className="icon text-gray-400" />
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <BookOpen className="icon text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">Основы винного сервиса</h3>
                  <p className="text-gray-600">Не начато</p>
                </div>
                <ChevronRight className="icon text-gray-400" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Learning; 
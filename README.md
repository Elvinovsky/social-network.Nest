![Nest.js](https://img.shields.io/badge/Nest.js-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-yellow)
![JWT](https://img.shields.io/badge/JWT-orange)
![Jest](https://img.shields.io/badge/Jest-red)
![SOLID](https://img.shields.io/badge/SOLID-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Express.js](https://img.shields.io/badge/Express.js-green)
![Mongoose](https://img.shields.io/badge/Mongoose-green)
![TypeORM](https://img.shields.io/badge/TypeORM-yellow)
![Swagger](https://img.shields.io/badge/Swagger-brightgreen)
![RxJS](https://img.shields.io/badge/RxJS-lightgrey)
![UUID](https://img.shields.io/badge/UUID-lightgrey)
![Nodemailer](https://img.shields.io/badge/Nodemailer-blue)
![Bcrypt](https://img.shields.io/badge/Bcrypt-lightgrey)

# Social-Network.Nest
Проект представляет собой учебный пет-проект, созданный с использованием фреймворка Nest.js. Основной целью проекта является обучение и практика в области веб-разработки, а также использование принципов SOLID и модульного программирования.

## Основные цели:

Обучение: Проект предназначен для изучения современных технологий веб-разработки и практической отработки навыков.

Применение принципов SOLID: Проект демонстрирует применение принципов SOLID, что позволяет создать гибкую и поддерживаемую систему.

## Функциональность:

Аутентификация и авторизация: Реализованы методы аутентификации и авторизации с использованием различных стратегий, включая локальную аутентификацию, JWT-токены и другие.

Управление блогами и постами: Проект предоставляет API для создания, редактирования и удаления блогов и постов.

Лайки и дизлайки: Добавлена функциональность лайков и дизлайков для блогов и постов, что позволяет пользователям выражать свое отношение к контенту.

Мультидевайсность: Добавлена мультидевайсность, что позволяет пользователям взаимодействовать с приложением с разных устройств.

Использование Refresh и Access токенов: Реализованы Refresh и Access токены для обеспечения безопасности и продления срока действия пользовательской сессии.

Работа с базами данных: Проект демонстрирует работу с различными типами баз данных, включая MongoDB и PostgreSQL.

Тестирование и отладка: Проект включает тесты для проверки функциональности и инструменты для отладки приложения.

## Используемый стек технологий
Этот проект использует следующий стек технологий:

NestJS: Фреймворк для создания масштабируемых Node.js приложений.

MongoDB: База данных NoSQL, используемая для хранения данных блогов.

TypeORM: ORM (Object-Relational Mapping) для работы с базами данных SQL, используется для некоторых частей приложения.

PostgreSQL: Реляционная база данных, используется в сочетании с TypeORM.

JWT (JSON Web Tokens): Используется для аутентификации и авторизации пользователей.

Passport: Библиотека для аутентификации, включая поддержку различных стратегий, таких как локальная, JWT и базовая аутентификация.

Swagger: Используется для создания документации API.

Jest: Фреймворк для тестирования.

Eslint: Инструмент для проверки кода на соответствие стандартам.

Prettier: Инструмент для форматирования кода.

## Настройки
Проект использует следующие переменные среды:

NODE_ENV: Окружение проекта (например, Development, Production).
MONGO_URL: URL для подключения к MongoDB.
DB_NAME: Имя базы данных MongoDB.
ACCESS_JWT_SECRET_KEY: Секретный ключ для создания JWT токенов.
REFRESH_JWT_SECRET_KEY: Секретный ключ для создания обновляемых JWT токенов.
ACCESS_TOKEN_EXPIRATION_TIME: Время жизни обычных JWT токенов.
REFRESH_TOKEN_EXPIRATION_TIME: Время жизни обновляемых JWT токенов.
AUTH_EMAIL: Электронная почта для аутентификации в приложении.
AUTH_PASS: Пароль для аутентификации в приложении.
BASIC_USER_NAME: Имя пользователя для базовой аутентификации.
BASIC_PASS: Пароль для базовой аутентификации.
REPO_TYPE: Тип репозитория, который используется в проекте (constants : typeORM | Mongo | sql).
DATABASE_TYPE: Тип базы данных SQL (например, postgres, mysql).
DATABASE_HOST: Хост для локальной базы данных SQL.
DATABASE_PORT: Порт для локальной базы данных SQL.
DATABASE_DB: Имя для локальной базы данных SQL.
DATABASE_USERNAME: Имя пользователя для локальной базы данных SQL.
DATABASE_PASSWORD: Пароль пользователя для локальной базы данных SQL.
POSTGRES_URL: URL для подключения к удаленной базе данных.

## Запуск проекта
Убедитесь, что у вас установлен Node.js.

Склонируйте репозиторий.

Создайте файл .env и добавьте в него необходимые настройки (см. выше).

# Installation
$ yarn install

Running the app
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod

# Test
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov

Проект будет доступен по адресу http://localhost:3000. Документация API Swagger будет доступна по адресу http://localhost:3000/api.

Хороших кодингов!

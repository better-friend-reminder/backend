# Better Friend Reminders

> Link to [Landing Page]()

> Link to [backend API](https://best-friend-reminders.herokuapp.com/)

## What is it?

- An app that allows to enter in all important dates by category and automatically blast out texts on loved one's special days. Never miss a special day for a friend or family member ever again!

- MVP: As a user I want to login and see a list of automated messages that I have previously set up so I can click on a message and edit or delete it. As a user I want to be able to create an automated message to a friend. A message should include a send date and time and a long text field that enables the message curator the ability to send a custom message.

- Stretch: Allow for a social media sharing aspect that allows you to advertise the app on your social media platform of choice.

## Motivation?

- Enable users to keep track of important dates
- Provide users a reliable way to send friends/family messages on an important date
- Never forget an important date or disappoint a friend/family

## How to install the project?

### Download Project Files

- **Fork** and **Clone** this repository.
- **CD into the folder** where you cloned the repository.

## API Endpoints

### Auth Endpoints

| Method | Endpoint      | Description                                                                                                                                                                                          |
| ------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | /api/register | Creates a `user` sent inside the `body` of the request. **Hashes** password before saving to the database. Returns the id of the new user and a JWT token to be used to access restricted endpoints. |
| POST   | /api/login    | Uses the credentials sent inside the `body` to authenticate the user. On successful login, creates a JWT token to be used to access restricted endpoints.                                            |

### REMINDER Endpoints

| Method | Endpoint           | Description                                                                                                         |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| GET    | /api/reminders     | Retrieves a list of all the reminders created by the logged in user.                                                |
| GET    | /api/reminders/:id | Retrieves a reminder specified by the `id` provided.                                                                |
| POST   | /api/reminders     | If all required fields (recipient name, recipient email, message, category, send date) are met, creates a reminder. |
| DELETE | /api/reminders/:id | Deletes the reminder with the specified `id`.                                                                       |
| PUT    | /api/reminder/:id  | Updates the reminder with the specified `id`.                                                                       |

## Data Models

### Reminder Data Model

| Field          | Type    | Description                                     |
| -------------- | ------- | ----------------------------------------------- |
| id             | Integer | ID of the newly created reminder.               |
| user_id        | Integer | User id of the user that created the reminder.  |
| recipientName  | String  | Name of the person the message will be sent to. |
| recipientEmail | String  | Email of the message recipient.                 |
| message        | String  | The text of the message.                        |
| category       | String  | The category that the reminder belongs to.      |
| sendDate       | date    | The date the message is scheduled to be sent.   |

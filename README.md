# Draftmysafe

Draftmysafe helps you close investments faster. In a few clicks, you can generate a standard YC SAFE, securely request the founder's information, and collect signatures.

## Getting Started

### Clone the repository

`git clone https://github.com/alanagoyal/draftmysafe`

### Set up the database
This project uses [Supabase](https://supabase.com) as a backend. To set up the database, create a [new project](https://database.new), enter your project details, and wait for the database to launch. Navigate to the SQL editor in the dashboard, paste the SQL from the [migration file](https://github.com/alanagoyal/draftmysafe/blob/main/supabase/migrations) into the SQL editor and press run. You can also use the Supabase CLI to do this locally.

Grab the project URL and anon key from the API settings and put them in a new `.env.local` file in the root directory as shown:
```
NEXT_PUBLIC_SUPABASE_URL="<your-supabase-url>" 
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
```

### Get your API keys
This project uses the following APIs:
- [OpenAI](https://openai.com) for chat completions and image generation
- [Braintrust](https://braintrustdata.com) for logging & evals
- [Resend](https://resend.com/) to send emails
- [Ampersand](https://withampersand.com) for the DocuSign integration
- [DocuSign](https://www.docusign.com/) for the e-signatures

For each, you can sign up for a free account, grab your API key, and paste it into `.env.local`.

### Install dependencies

`npm install`

### Run the application

Run the application in the command line and it will be available at http://localhost:3000.

`npm run dev`

### Deploy

Deploy using [Vercel](https://vercel.com)

## License

Licensed under the [MIT license](https://github.com/alanagoyal/draftmysafe/blob/main/LICENSE.md).

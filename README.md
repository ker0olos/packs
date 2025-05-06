### Fable

A portal app to create, manage and publish community packs

<https://packs.fable.ing/browse>

<p>
  <img width="320" alt="Screenshot of Browse page" src="https://github.com/user-attachments/assets/6459b712-6ec3-45f7-ae4a-ba4674f65a46">
  <img width="320" alt="Screenshot of Edit Pack page" src="https://github.com/user-attachments/assets/d0cc8981-d491-4734-82f9-05ee0b62ad18">
</p>

### Contribute


```
npm run dev
```

### Self-host

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fker0olos%2Fpacks%2Ftree%2Fnext&env=DISCORD_CLIENT_ID,DISCORD_CLIENT_SECRET,API_ENDPOINT&project-name=fable-packs)

#### Required Environment Variables

- DISCORD_CLIENT_ID: a discord oauth client id
- DISCORD_CLIENT_SECRET: a discord oauth client secret
- BOT_TOKEN: a discord bot token
- API_ENDPOINT: an endpoint for a self-hosted instance of
  [Fable](https://github.com/ker0olos/fable)

#### Optional Variables

###### Send public packs update messages to a discord channel

- PUBLIC_DISCORD_WEBHOOK_URL: a discord webhook url

###### Allow users to upload their own images

- S3_KEY_ID: A S3-compatible key id
- S3_ACCESS_KEY: A S3-compatible key access key
- S3_BUCKET_NAME: A S3-compatible bucket name
- S3_ENDPOINT: A S3-compatible endpoint (for uploading)
- S3_PUBLIC_ENDPOINT: the public url for the bucket (the image file name will be
  added to the end e.g.: `S3_PUBLIC_ENDPOINT/filename.png`)

###### Allow users to auto generate descriptions

- GEMINI_API_KEY: A [Gemini API Key](https://aistudio.google.com/app/apikey)

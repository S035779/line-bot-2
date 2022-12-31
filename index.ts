import { ClientConfig, Client, middleware, MiddlewareConfig, WebhookEvent, TextMessage, MessageAPIResponseBase } from "@line/bot-sdk";
import express, { Application, Request, Response } from "express";

const clientConfig: ClientConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET,
}

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const PORT = process.env.PORT || 3000;

const client = new Client(clientConfig);

const app: Application = express();

const textEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const { replyToken } = event;
  const { text } = event.message;

  if (text === "こんにちは") {
    const response: TextMessage = {
      type: "text",
      text: "これはこれは",
    }
    await client.replyMessage(replyToken, response);
  }
};


app.get("/", async (_: Request, res: Response): Promise<Response> => {
  return  res.status(200).json({
    status: "success",
    message: "Connected successfully",
  })
});

app.post("/bot/webhook", middleware(middlewareConfig), async (req: Request, res: Response): Promise<Response> => {
  const events: WebhookEvent[] = req.body.events;

  const results = await Promise.all(
    events.map(
      async (event: WebhookEvent) => {
        try {
          await textEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }

          return res.status(500).json({
            status: "error",
          });
        }
      }
    )
  );

  return res.status(200).json({
    status: "success",
    results,
  })
});

app.listen(PORT, () => {
  console.log(`Application is live and listening on port ${PORT}`);
});

from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
)

response = client.chat.completions.create(
    model=os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "请只用中文回答：你好，给我一句测试回复。"}
    ],
    stream=False,
)

print(response.choices[0].message.content)
import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const ai = getAiClient();
    if (!ai) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured. Please add a valid Gemini API key in Settings > Secrets to enable live AI Sensei analysis.',
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { action, message, scenario, jlptLevel = 'N5', registerPolicy = 'Tokyo Casual Polite', history = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message input is required.' }, { status: 400 });
    }

    if (action === 'grammar_ask') {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Learner JLPT Level: ${jlptLevel}\nQuestion: ${message}`,
        config: {
          systemInstruction:
            'You are KOTO AI Sensei, an authoritative Japanese linguist and patient tutor. Provide a concise, crystal-clear explanation of the Japanese grammar question with natural Japanese examples (include kana reading in parentheses) and English translations. Keep the explanation under 160 words, structured cleanly without markdown code fences.',
        },
      });

      return NextResponse.json({
        answer: response.text ?? 'Unable to generate an explanation right now.',
      });
    }

    if (action === 'writing_evaluate') {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Evaluate this Japanese learner composition for JLPT ${jlptLevel} (${registerPolicy}):\n"${message}"`,
        config: {
          systemInstruction:
            'You are KOTO AI Sensei evaluating a Japanese learner sentence. Return strictly JSON with naturalnessScore (0-100), correctedJapanese, romaji, feedback, and keyTakeaway.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              naturalnessScore: { type: Type.INTEGER },
              correctedJapanese: { type: Type.STRING },
              romaji: { type: Type.STRING },
              feedback: { type: Type.STRING },
              keyTakeaway: { type: Type.STRING },
            },
            required: ['naturalnessScore', 'correctedJapanese', 'romaji', 'feedback', 'keyTakeaway'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return NextResponse.json(parsed);
    }

    // Default: 'roleplay' or 'tutor' turn in AI Sensei Tutor
    const scenarioContext = scenario
      ? `Scenario: ${scenario.title} (${scenario.japaneseTitle}). Persona: ${scenario.persona}. Setting: ${scenario.setting}.`
      : 'Scenario: Retro Kissaten Rengetsu in Tokyo. Persona: Master Tanaka (62), polite hospitality register.';

    const historyText = Array.isArray(history)
      ? history
          .slice(-6)
          .map((turn: { role: string; text: string }) => `${turn.role === 'user' ? 'Learner' : 'Sensei'}: ${turn.text}`)
          .join('\n')
      : '';

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `${scenarioContext}\nJLPT Level: ${jlptLevel}\nRegister Policy: ${registerPolicy}\nRecent conversation:\n${historyText}\n\nLearner just said: "${message}"`,
      config: {
        systemInstruction:
          'You are KOTO AI Sensei acting in-character for a Japanese roleplay while providing immediate morphological and sociolinguistic diagnostics on what the learner just said. Respond naturally in Japanese appropriate to the scenario and JLPT level. Return strictly JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyJapanese: {
              type: Type.STRING,
              description: 'In-character Japanese reply without furigana markup.',
            },
            replyRomaji: {
              type: Type.STRING,
              description: 'Natural Hepburn romaji for the reply.',
            },
            replyEnglish: {
              type: Type.STRING,
              description: 'Natural English translation of the reply.',
            },
            pedagogicalHint: {
              type: Type.STRING,
              description: 'Short helpful cue for what the learner can say next.',
            },
            naturalnessScore: {
              type: Type.INTEGER,
              description: 'Score 0-100 evaluating naturalness and grammar of the learner utterance.',
            },
            pitchAssessment: {
              type: Type.STRING,
              description: 'Short pitch/register note e.g. "Teineigo Verified" or "Flat Heiban Pitch".',
            },
            cultureNote: {
              type: Type.STRING,
              description: 'Concise 1-2 sentence sociolinguistic or etiquette insight.',
            },
            betterAlternative: {
              type: Type.STRING,
              description: 'A slightly more natural Tokyo native phrasing if helpful, or confirmation.',
            },
            suggestedReplies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jp: { type: Type.STRING },
                  en: { type: Type.STRING },
                },
                required: ['jp', 'en'],
              },
            },
            morphologyTokens: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  surface: { type: Type.STRING },
                  reading: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['surface', 'reading', 'partOfSpeech', 'explanation'],
              },
            },
          },
          required: [
            'replyJapanese',
            'replyRomaji',
            'replyEnglish',
            'pedagogicalHint',
            'naturalnessScore',
            'pitchAssessment',
            'cultureNote',
            'betterAlternative',
            'suggestedReplies',
            'morphologyTokens',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Gemini API route error:', error);
    const message = error instanceof Error ? error.message : 'Unexpected server error calling AI Sensei.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

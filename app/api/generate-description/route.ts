import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getClientIdentifier,
  getRateLimitHeaders,
} from "@/lib/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(clientId);

    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn),
        }
      );
    }

    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify user is admin or active staff
    const [{ data: adminRecord }, { data: staffRecord }] = await Promise.all([
      supabaseAdmin.from("admins").select("id").eq("id", user.id).maybeSingle(),
      supabaseAdmin.from("crm_staff").select("id").eq("id", user.id).eq("is_active", true).maybeSingle(),
    ]);

    if (!adminRecord && !staffRecord) {
      return NextResponse.json(
        { error: "Unauthorized: Admin or staff access required" },
        { status: 403 }
      );
    }

    // Use only server-side environment variable (not NEXT_PUBLIC)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      title,
      property_type,
      listing_type,
      location,
      features,
      project_details,
    } = body;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      Write a professional, attractive, and SEO-friendly property description for a real estate listing based on the following details:

      Property Title: ${title}
      Type: ${property_type} (${listing_type})
      Location: ${location.city}, ${location.state} (${location.area})
      Address: ${location.address}
      
      Key Features:
      - Bedrooms: ${features.bedrooms}
      - Bathrooms: ${features.bathrooms}
      - Area: ${project_details.carpet_area || "N/A"}
      
      Amenities: ${
        features.amenities
          ? features.amenities.join(", ")
          : "Standard amenities"
      }
      
      Project Details:
      ${
        project_details.config
          ? `- Configuration: ${project_details.config}`
          : ""
      }
      ${project_details.floors ? `- Floors: ${project_details.floors}` : ""}
      ${
        project_details.rera_possession
          ? `- RERA Possession: ${project_details.rera_possession}`
          : ""
      }
      ${
        project_details.possession_status
          ? `- Possession: ${project_details.possession_status}`
          : ""
      }
      
      Tone: Professional, luxurious, and inviting.
      
      IMPORTANT FORMATTING RULES:
      - Output ONLY plain text, NO markdown formatting
      - Do NOT use asterisks (*), bullet points, or any special characters
      - Do NOT use headers or bold text
      - Write in flowing paragraphs only
      - Two to three concise paragraphs highlighting the lifestyle, features, and convenience
      - Do not include any contact placeholders or fake phone numbers
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Error generating description:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}

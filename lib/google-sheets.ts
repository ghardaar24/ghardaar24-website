import { google } from "googleapis";

// Google Sheets client singleton
let sheets: ReturnType<typeof google.sheets> | null = null;

/**
 * Initialize Google Sheets client with service account credentials
 */
function getSheetsClient() {
  if (sheets) return sheets;

  let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error("Google Sheets credentials not configured");
  }

  // Handle different private key formats
  // The key might come with literal \n or actual newlines
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      private_key: privateKey,
      client_email: clientEmail,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

/**
 * Get the spreadsheet ID from environment
 */
function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) {
    throw new Error("Google Sheets spreadsheet ID not configured");
  }
  return id;
}

/**
 * Ensure sheet exists with headers, create if needed
 */
async function ensureSheetWithHeaders(
  sheetName: string,
  headers: string[]
): Promise<void> {
  const sheetsClient = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  try {
    // Check if sheet exists
    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === sheetName
    );

    if (!sheetExists) {
      // Create the sheet
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });

      // Add headers
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [headers],
        },
      });
    }
  } catch (error) {
    // If we can't check/create, just try to append and let it fail naturally
    if (process.env.NODE_ENV === "development") {
      console.error("Error ensuring sheet exists:", error);
    }
  }
}

/**
 * Append a row to a sheet
 */
async function appendRow(sheetName: string, values: string[]): Promise<void> {
  const sheetsClient = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheetsClient.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values],
    },
  });
}

// Sheet configuration
const SIGNUP_SHEET = "User Signups";
const SIGNUP_HEADERS = ["Timestamp", "Name", "Email", "Phone"];

const PROPERTY_SHEET = "Property Listings";
const PROPERTY_HEADERS = [
  "Timestamp",
  "Title",
  "Property Type",
  "Listing Type",
  "Price",
  "Location",
  "Owner Name",
  "Owner Phone",
  "Owner Email",
];

/**
 * Log a user signup to Google Sheets
 */
export async function appendUserSignup(data: {
  name: string;
  email: string;
  phone: string;
  timestamp: string;
}): Promise<void> {
  await ensureSheetWithHeaders(SIGNUP_SHEET, SIGNUP_HEADERS);
  await appendRow(SIGNUP_SHEET, [
    data.timestamp,
    data.name,
    data.email,
    data.phone,
  ]);
}

/**
 * Log a property listing to Google Sheets
 */
export async function appendPropertyListing(data: {
  title: string;
  property_type: string;
  listing_type: string;
  price: string;
  location: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  timestamp: string;
}): Promise<void> {
  await ensureSheetWithHeaders(PROPERTY_SHEET, PROPERTY_HEADERS);
  await appendRow(PROPERTY_SHEET, [
    data.timestamp,
    data.title,
    data.property_type,
    data.listing_type,
    data.price,
    data.location,
    data.owner_name,
    data.owner_phone,
    data.owner_email,
  ]);
}

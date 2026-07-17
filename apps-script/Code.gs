const SHEET_NAME = "Leads";
const PHOTO_FOLDER_NAME = "NextMove Lead Photos";

const COLUMNS = [
  "receivedAt",
  "requestId",
  "name",
  "email",
  "phone",
  "pickupStreet",
  "pickupCity",
  "pickupPostalCode",
  "pickupFloor",
  "pickupApt",
  "destinationStreet",
  "destinationCity",
  "destinationPostalCode",
  "destinationFloor",
  "destinationApt",
  "date",
  "size",
  "propertyType",
  "boxSmall2cu",
  "boxMedium3cu",
  "boxLarge5cu",
  "boxXLarge6cu",
  "totes",
  "beds",
  "dressers",
  "miscItems",
  "specialItems",
  "pickupStairs",
  "deliveryStairs",
  "pickupElevators",
  "deliveryElevators",
  "photos",
  "notes",
  "source",
  "userAgent"
];

const NUMERIC_COLUMNS = new Set([
  "boxSmall2cu",
  "boxMedium3cu",
  "boxLarge5cu",
  "boxXLarge6cu",
  "totes",
  "beds",
  "dressers",
  "pickupStairs",
  "deliveryStairs",
  "pickupElevators",
  "deliveryElevators"
]);

const JOINED_LIST_COLUMNS = new Set(["specialItems", "photos"]);

function doGet(e) {
  const params = (e && e.parameter) || {};

  if (params.testTelegram) {
    const config = getConfig_();

    if (String(params.testTelegram) !== String(config.chatId)) {
      return json_({
        ok: false,
        message: "Wrong testTelegram value. Use your TELEGRAM_CHAT_ID as the value."
      });
    }

    const testLead = normalizeLead_({
      name: "Test Lead",
      phone: "+1 555 000 0000",
      email: "test@example.com",
      pickupStreet: "1 Test St",
      pickupCity: "Fredericton",
      destinationStreet: "2 Test Ave",
      destinationCity: "Oromocto",
      date: "2026-08-01",
      size: "2 bedroom",
      propertyType: "Apartment or condo",
      boxSmall2cu: 4,
      boxMedium3cu: 6,
      notes: "Manual test from Apps Script doGet."
    });

    const telegram = sendTelegramSafe_(testLead);
    return json_({ ok: telegram.sent, telegram });
  }

  return ContentService
    .createTextOutput("OK: NextMove Apps Script is running")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  let data;

  try {
    data = parseJsonBody_(e);
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }

  if (data.action === "uploadPhoto") {
    return handlePhotoUpload_(data);
  }

  return handleLead_(data);
}

function handleLead_(data) {
  const lead = normalizeLead_(data);
  const sheet = saveLeadSafe_(lead);

  if (sheet.rowUrl) lead.sheetRowUrl = sheet.rowUrl;
  if (sheet.rowNumber) lead.sheetRowNumber = sheet.rowNumber;

  const telegram = sendTelegramSafe_(lead);

  Logger.log(JSON.stringify({ sheet, telegram }));

  return json_({
    ok: sheet.saved && telegram.sent,
    saved: sheet.saved,
    sheet,
    telegram
  });
}

function handlePhotoUpload_(data) {
  try {
    const mimeType = String(data.mimeType || "");

    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      return json_({ ok: false, message: "Unsupported image type." });
    }

    if (!data.dataBase64) {
      return json_({ ok: false, message: "Missing dataBase64." });
    }

    const folder = getOrCreatePhotoFolder_();
    const filename = safeFilename_(data.filename || "photo.jpg");
    const decoded = Utilities.base64Decode(String(data.dataBase64));
    const blob = Utilities.newBlob(decoded, mimeType, filename);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return json_({ ok: true, url: file.getUrl() });
  } catch (error) {
    return json_({ ok: false, message: String(error) });
  }
}

function saveLeadSafe_(lead) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const sheet = getOrCreateSheet_();
    const rowNumber = Math.max(sheet.getLastRow() + 1, 2);

    sheet.getRange(rowNumber, 1, 1, COLUMNS.length).setValues([buildRow_(lead)]);

    return {
      saved: true,
      rowNumber,
      rowUrl: makeSheetRowUrl_(sheet, rowNumber)
    };
  } catch (error) {
    console.error("Sheet save failed: " + error);
    return { saved: false, error: String(error) };
  } finally {
    try {
      lock.releaseLock();
    } catch (error) {
      // Nothing to release if waitLock failed.
    }
  }
}

function sendTelegramSafe_(lead) {
  try {
    return sendTelegram_(lead);
  } catch (error) {
    console.error("Telegram failed: " + error);
    return { sent: false, error: String(error) };
  }
}

function sendTelegram_(lead) {
  const config = getConfig_();

  if (!config.token) {
    return { sent: false, reason: "Missing Script Property TELEGRAM_BOT_TOKEN" };
  }

  if (!config.chatId) {
    return { sent: false, reason: "Missing Script Property TELEGRAM_CHAT_ID" };
  }

  const message = sendTelegramText_(lead, config);
  const photos = sendTelegramPhotos_(lead, config);

  return {
    sent: message.sent && photos.sent,
    message,
    photos
  };
}

function sendTelegramText_(lead, config) {
  return telegramFetch_(config.token, "sendMessage", {
    chat_id: config.chatId,
    text: buildTelegramMessage_(lead),
    parse_mode: "HTML",
    disable_web_page_preview: true
  }, true);
}

function sendTelegramPhotos_(lead, config) {
  const photoUrls = list_(lead.photos);

  if (!photoUrls.length) {
    return { sent: true, count: 0, skipped: 0 };
  }

  const blobs = [];
  const skipped = [];

  photoUrls.slice(0, 10).forEach((url, index) => {
    const blob = drivePhotoBlobFromUrl_(url, index);

    if (blob) {
      blobs.push(blob);
    } else {
      skipped.push(url);
    }
  });

  if (!blobs.length) {
    return {
      sent: false,
      count: 0,
      skipped: skipped.length,
      reason: "Could not read any photo files from Drive URLs."
    };
  }

  if (blobs.length === 1) {
    const result = telegramFetch_(config.token, "sendPhoto", {
      chat_id: config.chatId,
      photo: blobs[0],
      caption: "Photos for lead " + value_(lead.requestId, "")
    }, false);

    result.count = result.sent ? 1 : 0;
    result.skipped = skipped.length;
    return result;
  }

  const media = blobs.map((blob, index) => {
    const item = {
      type: "photo",
      media: "attach://photo" + index
    };

    if (index === 0) {
      item.caption = "Photos for lead " + value_(lead.requestId, "");
    }

    return item;
  });

  const payload = {
    chat_id: config.chatId,
    media: JSON.stringify(media)
  };

  blobs.forEach((blob, index) => {
    payload["photo" + index] = blob;
  });

  const result = telegramFetch_(config.token, "sendMediaGroup", payload, false);
  result.count = result.sent ? blobs.length : 0;
  result.skipped = skipped.length;
  return result;
}

function telegramFetch_(token, methodName, payload, asJson) {
  const options = {
    method: "post",
    payload: asJson ? JSON.stringify(payload) : payload,
    muteHttpExceptions: true
  };

  if (asJson) {
    options.contentType = "application/json";
  }

  const response = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + token + "/" + methodName,
    options
  );

  const status = response.getResponseCode();
  const bodyText = response.getContentText();
  let body;

  try {
    body = JSON.parse(bodyText);
  } catch (error) {
    body = { raw: bodyText };
  }

  return {
    sent: status >= 200 && status < 300 && body.ok === true,
    status,
    description: body.description || "",
    telegramOk: body.ok === true
  };
}

function buildTelegramMessage_(lead) {
  const boxTotal =
    number_(lead.boxSmall2cu) +
    number_(lead.boxMedium3cu) +
    number_(lead.boxLarge5cu) +
    number_(lead.boxXLarge6cu);

  const leadId = value_(lead.requestId, "no-id");
  const leadIdHtml = lead.sheetRowUrl
    ? '<a href="' + escapeHtml_(lead.sheetRowUrl) + '">' + escapeHtml_(leadId) + "</a>"
    : escapeHtml_(leadId);

  const lines = [
    "🚚 <b>New NextMove Lead</b>",
    "",
    "🆔 <b>Lead ID:</b> " + leadIdHtml,
    "👤 <b>Name:</b> " + escapeHtml_(value_(lead.name, "(no name)")),
    "📞 <b>Phone:</b> " + escapeHtml_(value_(lead.phone, "NO PHONE")),
    "📧 <b>Email:</b> " + escapeHtml_(value_(lead.email, "(no email)")),
    "",
    "📍 <b>Pickup:</b> " + escapeHtml_(address_(lead, "pickup")),
    "🏁 <b>Destination:</b> " + escapeHtml_(address_(lead, "destination")),
    "",
    "📅 <b>Move Date:</b> " + escapeHtml_(value_(lead.date, "not set")),
    "📦 <b>Move Size:</b> " + escapeHtml_(value_(lead.size, "not set"))
  ];

  if (lead.propertyType) {
    lines.push("🏠 <b>Property Type:</b> " + escapeHtml_(lead.propertyType));
  }

  const inventory = [];
  if (boxTotal > 0) inventory.push("📦 Boxes: " + boxTotal);
  if (number_(lead.totes) > 0) inventory.push("🧺 Totes: " + number_(lead.totes));
  if (number_(lead.beds) > 0) inventory.push("🛏️ Beds: " + number_(lead.beds));
  if (number_(lead.dressers) > 0) inventory.push("🗄️ Dressers: " + number_(lead.dressers));

  if (inventory.length) {
    lines.push("", "🧾 <b>Inventory:</b>");
    inventory.forEach((item) => lines.push(escapeHtml_(item)));
  }

  const specialItems = list_(lead.specialItems);
  if (specialItems.length) {
    lines.push("⚠️ <b>Special Items:</b> " + escapeHtml_(specialItems.join(", ")));
  }

  if (lead.miscItems) {
    lines.push("📝 <b>Other Items:</b> " + escapeHtml_(lead.miscItems));
  }

  if (number_(lead.pickupStairs) > 0 || number_(lead.deliveryStairs) > 0) {
    lines.push(
      "🪜 <b>Stairs:</b> pickup " +
      number_(lead.pickupStairs) +
      ", delivery " +
      number_(lead.deliveryStairs)
    );
  }

  if (number_(lead.pickupElevators) > 0 || number_(lead.deliveryElevators) > 0) {
    lines.push(
      "🛗 <b>Elevators:</b> pickup " +
      number_(lead.pickupElevators) +
      ", delivery " +
      number_(lead.deliveryElevators)
    );
  }

  if (lead.notes) {
    lines.push("", "💬 <b>Notes:</b> " + escapeHtml_(lead.notes));
  }

  const photos = list_(lead.photos);
  if (photos.length) {
    lines.push("", "📸 <b>Photos:</b> attached below (" + photos.length + ")");
  }

  if (lead.sheetRowUrl) {
    lines.push("", "🔎 <a href=\"" + escapeHtml_(lead.sheetRowUrl) + "\"><b>Open full lead details in Google Sheets</b></a>");
  }

  return lines.join("\n");
}

function getOrCreateSheet_() {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    setupHeader_(sheet);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    setupHeader_(sheet);
  }

  return sheet;
}

function setupHeader_(sheet) {
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  sheet.getRange(1, 1, 1, COLUMNS.length)
    .setFontWeight("bold")
    .setBackground("#0B4C5F")
    .setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
}

function getSpreadsheet_() {
  const config = getConfig_();

  if (config.spreadsheetId) {
    return SpreadsheetApp.openById(config.spreadsheetId);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error("No spreadsheet found. Bind the script to a Google Sheet or set SPREADSHEET_ID.");
  }

  return active;
}

function makeSheetRowUrl_(sheet, rowNumber) {
  const spreadsheet = sheet.getParent();
  const spreadsheetId = spreadsheet.getId();
  const gid = sheet.getSheetId();
  const lastColumn = columnLetter_(COLUMNS.length);

  return "https://docs.google.com/spreadsheets/d/" +
    encodeURIComponent(spreadsheetId) +
    "/edit#gid=" +
    encodeURIComponent(String(gid)) +
    "&range=A" +
    rowNumber +
    ":" +
    lastColumn +
    rowNumber;
}

function getOrCreatePhotoFolder_() {
  const folders = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(PHOTO_FOLDER_NAME);
}

function drivePhotoBlobFromUrl_(url, index) {
  try {
    const fileId = driveFileIdFromUrl_(url);
    if (!fileId) return null;

    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    blob.setName("lead-photo-" + (index + 1) + fileExtensionFromMimeType_(blob.getContentType()));

    return blob;
  } catch (error) {
    console.error("Could not load photo from Drive URL: " + error);
    return null;
  }
}

function driveFileIdFromUrl_(url) {
  const text = String(url || "");
  let match = text.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  match = text.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  match = text.match(/[?&]fileId=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  return "";
}

function fileExtensionFromMimeType_(mimeType) {
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  return ".jpg";
}

function buildRow_(lead) {
  return COLUMNS.map((key) => {
    const value = lead[key];

    if (JOINED_LIST_COLUMNS.has(key)) {
      return list_(value).join(", ");
    }

    if (NUMERIC_COLUMNS.has(key)) {
      if (value === null || value === undefined || value === "") return "";
      const num = Number(value);
      return Number.isFinite(num) ? num : "";
    }

    return value === null || value === undefined ? "" : value;
  });
}

function normalizeLead_(data) {
  const lead = Object.assign({}, data);
  if (!lead.receivedAt) lead.receivedAt = new Date().toISOString();
  if (!lead.requestId) lead.requestId = Utilities.getUuid();
  if (!lead.source) lead.source = "nextmove-website";
  return lead;
}

function parseJsonBody_(e) {
  const raw = e && e.postData && e.postData.contents;
  if (!raw) throw new Error("Missing POST body.");
  return JSON.parse(raw);
}

function getConfig_() {
  const props = PropertiesService.getScriptProperties();

  return {
    token: String(props.getProperty("TELEGRAM_BOT_TOKEN") || "").trim(),
    chatId: String(props.getProperty("TELEGRAM_CHAT_ID") || "").trim(),
    spreadsheetId: String(props.getProperty("SPREADSHEET_ID") || "").trim()
  };
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeFilename_(filename) {
  return String(filename).replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 100) || "photo.jpg";
}

function address_(lead, prefix) {
  const street = value_(lead[prefix + "Street"], "?");
  const city = value_(lead[prefix + "City"], "?");
  const postal = value_(lead[prefix + "PostalCode"], "");
  const floor = value_(lead[prefix + "Floor"], "");
  const apt = value_(lead[prefix + "Apt"], "");

  return [street, city, postal, floor ? "floor " + floor : "", apt ? "apt " + apt : ""]
    .filter(Boolean)
    .join(", ");
}

function list_(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (!value) return [];

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function value_(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function number_(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function columnLetter_(columnNumber) {
  let column = "";
  let number = columnNumber;

  while (number > 0) {
    const remainder = (number - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    number = Math.floor((number - 1) / 26);
  }

  return column;
}

function testTelegram() {
  const result = sendTelegramSafe_(normalizeLead_({
    name: "Test Lead",
    phone: "+1 555 000 0000",
    email: "test@example.com",
    pickupStreet: "1 Test St",
    pickupCity: "Fredericton",
    destinationStreet: "2 Test Ave",
    destinationCity: "Oromocto",
    date: "2026-08-01",
    size: "2 bedroom",
    propertyType: "Apartment or condo",
    boxSmall2cu: 4,
    boxMedium3cu: 6,
    notes: "Manual test from Apps Script editor."
  }));

  Logger.log(JSON.stringify(result));
}

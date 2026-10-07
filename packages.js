// Sessions, packages and prices. Used by the main page, the booking page and the booking service
// (which reads the prices from here, so a deposit is always worked out from the real price).
// Keep it valid JSON between the outer braces.
window.PRICES = {
  "depositPercent": 50,
  "otherDeposit": 0,
  "sessions": ["Kiddies Birthday & Cake Smash", "Adult Birthday", "Maternity", "Graduation", "Couples & Family", "Outdoor", "Corporate", "Events", "Product", "Videography"],
  "packages": [
    {"session": "Adult Birthday", "name": "Standard Package", "price": 750, "features": ["30 minute session", "20 high-res images", "10 pro edited images", "Studio props / customised theme", "2 outfit changes", "Online gallery"]},
    {"session": "Adult Birthday", "name": "Snoot Package", "price": 880, "features": ["30 minute session", "20 high-res images", "10 pro edited images", "Gobo light effects", "2 outfit changes", "Online gallery"]},
    {"session": "Adult Birthday", "name": "Pop Through Paper Package", "price": 1150, "features": ["45 minute session", "15 pro edited images", "Paper pop-up effect", "1 minute video (tear cheer)", "2 outfit changes", "Online gallery"]},
    {"session": "Adult Birthday", "name": "Premium Package", "price": 1400, "tag": "Everything included", "features": ["1 hour session", "25 high-res images", "15 pro edited images", "Paper pop-up & snoot effect", "1 minute video (tear cheer)", "3 different backdrops", "Studio props / customised theme", "3 outfit changes", "Online gallery"]}
  ]
};

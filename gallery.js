// Gallery photos, grouped by backdrop. Managed from admin.html.
// Each photo: id (its file name in img/ without -700/-1600), caption, categories, and the width and height of the 700px image.
window.GALLERY = {
  "dark": [
    {"id":"birthday-burning-headline","caption":"Leveling up to 30","categories":["birthdays","women"],"w":700,"h":1050},
    {"id":"birthday-60th-cake","caption":"Happy 60th","categories":["birthdays","women"],"w":700,"h":1050},
    {"id":"graduation-directors-chair","caption":"Graduate in the director’s chair","categories":["graduation","women"],"w":700,"h":956},
    {"id":"graduation-success-book","caption":"Success, in print","categories":["graduation","women"],"w":700,"h":467},
    {"id":"couple-black-embrace","caption":"Together in black","categories":["couples"],"w":700,"h":1050},
    {"id":"maternity-white-tulle-train","caption":"White tulle maternity","categories":["maternity","women"],"w":700,"h":1033},
    {"id":"graduation-man-portrait","caption":"Graduation portrait","categories":["men","graduation"],"w":700,"h":1047},
    {"id":"birthday-roses-black-gown","caption":"Roses & black gown","categories":["women","birthdays"],"w":700,"h":1050},
    {"id":"maternity-golden-crown","caption":"Golden crown maternity","categories":["maternity","women"],"w":628,"h":768},
    {"id":"maternity-couple-red","caption":"Expecting couple","categories":["maternity","couples"],"w":700,"h":1023}
  ],
  "grey": [
    {"id":"birthday-30-wine-glass","caption":"A toast to 30","categories":["birthdays","women"],"w":700,"h":1050},
    {"id":"birthday-25-red-stool","caption":"25 & blooming","categories":["birthdays","women"],"w":700,"h":1049},
    {"id":"birthday-14th-spotlight","caption":"Sweet 14 in the spotlight","categories":["birthdays","kids"],"w":700,"h":1032},
    {"id":"couple-red-gown-navy-suit","caption":"Red gown & navy suit","categories":["couples"],"w":700,"h":1065},
    {"id":"portrait-spotlight-navy","caption":"Spotlight portrait","categories":["portraits","women"],"w":700,"h":1050},
    {"id":"graduation-family","caption":"Graduate & grandmother","categories":["men","graduation","family"],"w":700,"h":1050},
    {"id":"couple-mom-dad-caps","caption":"Mom & Dad to be","categories":["couples","family"],"w":700,"h":467},
    {"id":"maternity-silhouette","caption":"Maternity silhouette","categories":["maternity","couples"],"w":700,"h":1047},
    {"id":"maternity-red-gown","caption":"Maternity in red","categories":["maternity","women"],"w":700,"h":977},
    {"id":"birthday-25th","caption":"25th birthday","categories":["women","birthdays"],"w":700,"h":913},
    {"id":"birthday-clock","caption":"Time to celebrate","categories":["women","birthdays"],"w":700,"h":1049}
  ],
  "white": [
    {"id":"baby-brothers-beige","caption":"Brothers in beige","categories":["babies","kids","family"],"w":700,"h":1050},
    {"id":"baby-blue-cap-chair","caption":"Little gentleman in blue","categories":["babies","kids"],"w":700,"h":1050},
    {"id":"birthday-may-calendar","caption":"Breaking through May","categories":["birthdays","women"],"w":700,"h":1050},
    {"id":"birthday-slaying-white","caption":"Slaying in white","categories":["birthdays","women"],"w":700,"h":1025},
    {"id":"birthday-hello-30-cake","caption":"Hello 30","categories":["birthdays","women"],"w":700,"h":467},
    {"id":"graduation-mom-kiss","caption":"A kiss from Mom","categories":["graduation","family"],"w":700,"h":1050},
    {"id":"graduation-little-scholar","caption":"Little scholar","categories":["graduation","kids"],"w":700,"h":1050},
    {"id":"graduation-class-of-2025","caption":"Class of 2025","categories":["graduation","women"],"w":700,"h":467},
    {"id":"couple-red-roses","caption":"Roses & forehead touch","categories":["couples"],"w":700,"h":1050},
    {"id":"portrait-timberland-step","caption":"Fresh steps","categories":["portraits","men"],"w":700,"h":1050},
    {"id":"portrait-beret-chair","caption":"Beret & folding chair","categories":["portraits","men"],"w":700,"h":1050},
    {"id":"portrait-leather-jacket","caption":"Leather & shades","categories":["portraits","men"],"w":700,"h":1050},
    {"id":"friends-white-tees","caption":"Friends in white","categories":["family"],"w":700,"h":467},
    {"id":"maternity-golden-halo","caption":"Golden halo maternity","categories":["maternity","women"],"w":700,"h":467},
    {"id":"women-black-gown","caption":"Studio portrait","categories":["women"],"w":700,"h":1050},
    {"id":"women-burgundy-suit","caption":"Burgundy editorial","categories":["women"],"w":700,"h":1050},
    {"id":"women-flower-wreath","caption":"Flower wreath","categories":["women"],"w":700,"h":1050},
    {"id":"birthday-30th","caption":"30th birthday","categories":["women","birthdays"],"w":700,"h":1050},
    {"id":"birthday-21st","caption":"21st birthday","categories":["women","birthdays"],"w":700,"h":1050},
    {"id":"birthday-crown-roses","caption":"Queen for the day","categories":["women","birthdays"],"w":700,"h":1050},
    {"id":"graduation-woman-balloons","caption":"Class of 2026","categories":["women","graduation"],"w":700,"h":1050},
    {"id":"kids-tulle-dress","caption":"Tulle & twirls","categories":["kids"],"w":700,"h":1050}
  ],
  "colour": [
    {"id":"baby-one-pastel-castle","caption":"Hello, ONE","categories":["babies","kids","birthdays"],"w":700,"h":494},
    {"id":"baby-piano-17-may","caption":"Birthday tunes","categories":["babies","kids","birthdays"],"w":700,"h":1050},
    {"id":"baby-pink-knit-swing","caption":"Little swing, big eyes","categories":["babies","kids"],"w":700,"h":1029},
    {"id":"graduation-classroom-set","caption":"I graduated!","categories":["graduation","kids"],"w":700,"h":1050},
    {"id":"portrait-pinstripe-blazer","caption":"Pinstripe & boots","categories":["portraits","women"],"w":700,"h":1050},
    {"id":"maternity-couple-baby-vest","caption":"Couple with baby’s first vest","categories":["maternity","couples"],"w":700,"h":467},
    {"id":"maternity-mountain-sparkle","caption":"Sparkle gown against the mountains","categories":["maternity","women"],"w":700,"h":467},
    {"id":"kids-rainbow-castle","caption":"Rainbow cake smash","categories":["kids","birthdays"],"w":700,"h":963},
    {"id":"kids-princess-throne","caption":"Little princess","categories":["kids","birthdays"],"w":700,"h":1050},
    {"id":"kids-second-birthday","caption":"Butterfly second birthday","categories":["kids","birthdays"],"w":700,"h":535},
    {"id":"kids-cake-smash-bluey","caption":"Bluey cake smash","categories":["kids","birthdays"],"w":700,"h":1050},
    {"id":"kids-first-birthday-beach","caption":"Beach first birthday","categories":["kids","birthdays"],"w":700,"h":448},
    {"id":"birthday-pink-cake","caption":"Pretty in pink","categories":["women","birthdays"],"w":700,"h":1050},
    {"id":"maternity-green-drape","caption":"Mint maternity","categories":["maternity","women"],"w":700,"h":1049},
    {"id":"graduation-portrait","caption":"Graduation close-up","categories":["women","graduation"],"w":700,"h":1050}
  ],
  "outdoor": [
    {"id":"outdoor-couple-union-buildings","caption":"Union Buildings couple","categories":["couples","outdoor"],"w":700,"h":466},
    {"id":"outdoor-couple-kiss","caption":"Outdoor love story","categories":["couples","outdoor"],"w":700,"h":466}
  ]
};

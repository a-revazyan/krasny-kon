/* Нейровидео: каталог работ.
   Источник — сайт-кинотеатр github.com/a-revazyan/a-revazyan.github.io (src/data/works.json).
   Видео и постеры берутся оттуда напрямую, в этот репозиторий не копируются. */
window.NV = {
  base: 'https://a-revazyan.github.io/',
  categories: {"feature": "Короткий метр", "series": "Сериал", "ads": "Реклама", "lab": "Эксперименты"},
  works: [
  {
    "slug": "son-raskolnikova",
    "title": "Сон Раскольникова",
    "cat": "feature",
    "kind": "мини-фильм по «Преступлению и наказанию»",
    "about": "Мини-фильм по «Преступлению и наказанию»: лихорадочный сон героя в жёлтом свете петербургских лестниц.",
    "orientation": "h",
    "poster": "son-raskolnikova.jpg",
    "spec": false,
    "parts": [
      {
        "label": "",
        "video": "son-raskolnikova.mp4",
        "duration": 261,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "kamo-gryadeshi",
    "title": "Камо грядеши",
    "cat": "feature",
    "kind": "мини-фильм",
    "about": "Мини-фильм по роману Сенкевича: Рим времён Нерона.",
    "orientation": "h",
    "poster": "kamo-gryadeshi.jpg",
    "spec": false,
    "parts": [
      {
        "label": "",
        "video": "kamo-gryadeshi.mp4",
        "duration": 254,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "lit-energy-film",
    "title": "Lit Energy",
    "cat": "feature",
    "kind": "мини-фильм",
    "about": "Короткая история о том, как напиток наполняет энергией и уверенностью в себе.",
    "orientation": "h",
    "poster": "lit-energy-film.jpg",
    "spec": false,
    "parts": [
      {
        "label": "",
        "video": "lit-energy-film.mp4",
        "duration": 71,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "glam-squad",
    "title": "Glam Squad",
    "cat": "series",
    "kind": "мини мульт-сериал",
    "about": "Мини мульт-сериал о четырёх подругах, которые помогают другим девушкам справляться с бытовыми проблемами.",
    "orientation": "v",
    "poster": "glam-squad.jpg",
    "spec": false,
    "parts": [
      {
        "label": "Серия 1",
        "video": "glam-squad-01.mp4",
        "duration": 53,
        "orientation": "v"
      },
      {
        "label": "Серия 2",
        "video": "glam-squad-02.mp4",
        "duration": 61,
        "orientation": "v"
      },
      {
        "label": "Серия 3",
        "video": "glam-squad-03.mp4",
        "duration": 100,
        "orientation": "v"
      },
      {
        "label": "Серия 4",
        "video": "glam-squad-04.mp4",
        "duration": 35,
        "orientation": "v"
      },
      {
        "label": "Серия 5",
        "video": "glam-squad-05.mp4",
        "duration": 44,
        "orientation": "v"
      },
      {
        "label": "Проходка",
        "video": "glam-squad-prohodka.mp4",
        "duration": 11,
        "orientation": "s"
      },
      {
        "label": "Рассказ о мультфильме",
        "video": "glam-squad-making-of.mp4",
        "duration": 50,
        "orientation": "v"
      }
    ]
  },
  {
    "slug": "calvin-klein",
    "title": "Calvin Klein",
    "cat": "ads",
    "kind": "рекламный ролик",
    "about": "Реклама, в которой затрагивается проблема мракобесия.",
    "orientation": "h",
    "poster": "calvin-klein.jpg",
    "spec": true,
    "parts": [
      {
        "label": "",
        "video": "calvin-klein.mp4",
        "duration": 56,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "gap",
    "title": "GAP",
    "cat": "ads",
    "kind": "рекламный ролик",
    "about": "Шуточная реклама одежды бренда GAP.",
    "orientation": "h",
    "poster": "gap.jpg",
    "spec": true,
    "parts": [
      {
        "label": "",
        "video": "gap.mp4",
        "duration": 34,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "swarovski",
    "title": "Swarovski",
    "cat": "ads",
    "kind": "рекламный ролик",
    "about": "Свет одного кристалла превращается в сказку.",
    "orientation": "v",
    "poster": "swarovski.jpg",
    "spec": true,
    "parts": [
      {
        "label": "",
        "video": "swarovski.mp4",
        "duration": 19,
        "orientation": "v"
      }
    ]
  },
  {
    "slug": "twix",
    "title": "Twix",
    "cat": "ads",
    "kind": "рекламный ролик",
    "about": "История двух половинок: встреча, дверь с номером 7 и вечерний город.",
    "orientation": "h",
    "poster": "twix.jpg",
    "spec": true,
    "parts": [
      {
        "label": "",
        "video": "twix.mp4",
        "duration": 33,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "yandex-3d-motion",
    "title": "Яндекс Заметки",
    "cat": "ads",
    "kind": "3D motion",
    "about": "3D-моушн: идеи, списки и заметки оживают в интерфейсе.",
    "orientation": "h",
    "poster": "yandex-3d-motion.jpg",
    "spec": true,
    "parts": [
      {
        "label": "",
        "video": "yandex-3d-motion.mp4",
        "duration": 43,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "lit-energy-ad",
    "title": "Lit Energy",
    "cat": "ads",
    "kind": "рекламный ролик",
    "about": "Ночная гонка в неоне: шлем, скорость и банка Stay Lit.",
    "orientation": "h",
    "poster": "lit-energy-ad.jpg",
    "spec": true,
    "parts": [
      {
        "label": "",
        "video": "lit-energy-ad.mp4",
        "duration": 22,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "zolotoy-klyuch",
    "title": "ЖК «Золотой ключ»",
    "cat": "ads",
    "kind": "рекламный ролик",
    "about": "Жизнь у воды: дом, озеро и катер у причала.",
    "orientation": "h",
    "poster": "zolotoy-klyuch.jpg",
    "spec": false,
    "parts": [
      {
        "label": "",
        "video": "zolotoy-klyuch.mp4",
        "duration": 41,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "tenoten",
    "title": "Тенотен",
    "cat": "ads",
    "kind": "рекламный ролик",
    "about": "Из офисной суеты на зелёные холмы: «телепорт в безмятежность».",
    "orientation": "h",
    "poster": "tenoten.jpg",
    "spec": true,
    "parts": [
      {
        "label": "",
        "video": "tenoten.mp4",
        "duration": 29,
        "orientation": "h"
      }
    ]
  },
  {
    "slug": "sobaka-ru",
    "title": "Собака.ру",
    "cat": "ads",
    "kind": "имиджевый ролик",
    "about": "Чёрно-белая графика: силуэты, взгляд и журнал.",
    "orientation": "s",
    "poster": "sobaka-ru.jpg",
    "spec": true,
    "parts": [
      {
        "label": "",
        "video": "sobaka-ru.mp4",
        "duration": 14,
        "orientation": "s"
      }
    ]
  },
  {
    "slug": "ai-influencer",
    "title": "AI-инфлюенсер",
    "cat": "lab",
    "kind": "серия клипов",
    "about": "Серия клипов с блогером, которого целиком придумала нейросеть.",
    "orientation": "v",
    "poster": "ai-influencer.jpg",
    "spec": false,
    "parts": [
      {
        "label": "Серия 1",
        "video": "ai-influencer-01.mp4",
        "duration": 5,
        "orientation": "v"
      },
      {
        "label": "Серия 2",
        "video": "ai-influencer-02.mp4",
        "duration": 12,
        "orientation": "s"
      },
      {
        "label": "Серия 3",
        "video": "ai-influencer-03.mp4",
        "duration": 15,
        "orientation": "v"
      },
      {
        "label": "Серия 4",
        "video": "ai-influencer-04.mp4",
        "duration": 11,
        "orientation": "v"
      },
      {
        "label": "Серия 5",
        "video": "ai-influencer-05.mp4",
        "duration": 7,
        "orientation": "v"
      }
    ]
  }
]
};

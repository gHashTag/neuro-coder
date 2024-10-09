import { Context, InputFile } from "grammy";
import { createSlideshow as createSlideshowVideo, SlideshowOptions } from 'slideshow-video';

import { createAudioFileFromText, createRender, generateImageNeuroBroker, generateImagesForNeuroBroker, getMeditationSteps, getSellVillaSteps, mergeAudioFiles, translateText } from "../helpers";
import { Step } from "src/utils/types";
import { InputMediaPhoto } from "grammy/types";
import { getVideoUrl, uploadVideo } from "../../core/supabase/video";

const triggerWord = "KATA";

const type = "condominium";

const livingRoomDescription = `
  The living room of this luxury ${type} ${triggerWord} is a masterpiece of modern minimalist design. It features a spacious open-plan layout with floor-to-ceiling windows that flood the space with natural light. The centerpiece is a sleek TV unit wall in a sophisticated grey and beige color palette, complemented by LED lights under the shelf of the TV cabinet. The room is furnished with plush, neutral-toned sofas and accented with contemporary art pieces. The design emphasizes clean lines and a seamless flow, creating an atmosphere of tranquility and elegance. High-resolution photography captures the exquisite details and the breathtaking view of the surrounding landscape.

  Key Features:
  - Open-plan layout with panoramic views
  - Modern TV unit with ambient LED lighting
  - Elegant furnishings and contemporary art
  - Seamless integration of indoor and outdoor spaces
`;

const kitchenDescription = `
  The kitchen in this luxury ${type} ${triggerWord} is a chef's dream, combining functionality with high-end aesthetics. It boasts state-of-the-art appliances seamlessly integrated into custom cabinetry with a matte finish. The central island, crafted from polished marble, serves as both a workspace and a social hub, with bar seating for casual dining. The color scheme of soft greys and whites enhances the minimalist design, while under-cabinet LED lighting adds a touch of sophistication. This kitchen is designed for both culinary excellence and stylish entertaining, with ample space for hosting guests.

  Key Features:
  - State-of-the-art appliances and custom cabinetry
  - Polished marble island with bar seating
  - Soft grey and white color palette
  - Under-cabinet LED lighting for ambiance
`;

const bedroomDescription = `
  The master bedroom of this luxury ${type} ${triggerWord} is a sanctuary of comfort and style. It features a king-sized bed with a plush upholstered headboard, set against a backdrop of textured wall panels in soothing neutral tones. Large windows offer stunning views and allow natural light to enhance the serene atmosphere. The room includes a spacious walk-in closet and an en-suite bathroom with a freestanding tub and rain shower. High-quality materials and meticulous attention to detail are evident throughout, creating a space that is both luxurious and inviting.

  Key Features:
  - King-sized bed with upholstered headboard
  - Textured wall panels in neutral tones
  - Walk-in closet and en-suite bathroom
  - Freestanding tub and rain shower
`;

const bathroomDescription = `
  The bathroom in this luxury ${type} ${triggerWord} is a spa-like retreat, designed with relaxation in mind. It features a freestanding soaking tub positioned to take advantage of the panoramic views, and a walk-in rain shower enclosed in glass. The double vanity is crafted from natural stone, with sleek fixtures and ample storage. The use of warm, earthy tones and natural materials creates a calming environment, while large mirrors and strategic lighting enhance the sense of space and luxury. This bathroom is a perfect blend of elegance and functionality.

  Key Features:
  - Freestanding soaking tub with panoramic views
  - Walk-in rain shower with glass enclosure
  - Double vanity with natural stone and sleek fixtures
  - Warm, earthy tones and natural materials
`;

const outdoorDescription = `
  The outdoor area of this luxury ${type} ${triggerWord} is an oasis of leisure and entertainment. It features an infinity pool that seamlessly blends with the horizon, surrounded by a spacious deck with sun loungers and a shaded lounge area. The landscaped gardens are meticulously maintained, offering a variety of seating areas and a fire pit for evening gatherings. An outdoor kitchen and dining area provide the perfect setting for alfresco meals, with views of the surrounding landscape enhancing the experience. This outdoor space is designed for both relaxation and socializing, making it an ideal retreat.

  Key Features:
  - Infinity pool with horizon views
  - Spacious deck with sun loungers and shaded lounge
  - Landscaped gardens with seating areas and fire pit
  - Outdoor kitchen and dining area
`;
const location = 'Phuket, Thailand'

const description = `
  We have recently launched 2 new condominium projects in ${location}. Project Highlights: 1. Origin Place centre phuket : - 400 m. to Central Phuket by walking - 900 m. to Head start international school - 2 km to Bangkok hospital - 3.8 km to Phuket old town 2. SO Origin Kata : - 800 m. to kata beach by walking - 350 m. to kata night plaza - 450 m. to Club beach - The biggest mixed used in Kata Beach - 1.2 km to karon beach. This is the best time for agents to come and select the units for your clients. Don't miss out on this fantastic opportunity to secure prime units in these highly desirable locations. Please note the following Foreigner Quota deposit conditions: - For SO Origin Kata Beach: 50,000 THB per unit - For Origin Place Centre Phuket: 50,000 THB per unit - exclusive stocks for 3 months - Minimum of 10 units required We believe these projects have great potential and would love to discuss how we can collaborate to make them a success. Please let us know your availability for a meeting or a call to explore this further.
`;

interface SlideshowResponse {
  filePath: string;
  numberTrack: number;
}



const neuro_broker = async (ctx: Context): Promise<void> => {
  try {
    // Отправляем уведомление пользователю, что бот печатает
    await ctx.replyWithChatAction("typing");

    // Проверяем, есть ли информация о пользователе
    if (!ctx.from) throw new Error("User not found");
 
    // // Получаем шаги медитации
    const sellVillaSteps = await getSellVillaSteps({
      prompt: `Create a viral description in one paragraph 15 seconds long without numbers. At the end write: write in the comments ${triggerWord} and get direct access to the developer: ${description}. Create 5 coherent steps with very short one-sentence abstracts on the topic of creating a short video script to sell a luxury ${type}. Every description should be trigger word ${triggerWord}. Answer in json format. The structure should be as follows:
    
            {
              "activities": [
                {
                  "activity": "Creating a short video script to sell a luxury ${type} in location: ${location}",
                  "description": ${description},
                  "steps": [
                    {
                      "step": "Step 1",
                      "details": ${livingRoomDescription},
                    },
                    {
                      "step": "Step 2",
                      "details": ${kitchenDescription},
                    },
                    {
                      "step": "Step 3",
                      "details": ${bedroomDescription},
                    },
                    {
                      "step": "Step 4",
                      "details": ${bathroomDescription},
                    },
                    {
                      "step": "Step 5",
                      "details": ${outdoorDescription},
                    }
                  ]
                }
              ]
            }
    
            Ensure that the steps are coherent and flow logically from one to the next, creating an engaging narrative for the video.`,
            location,
            type
          });
    
    console.log(sellVillaSteps, "sellVillaSteps");

    const stepsData: Step[] = await Promise.all(
      sellVillaSteps.activities[0].steps.map(async (step: { step: string; details: string }, index: number) => ({
        step: `Step ${index + 1}`,
        details: {
          en: step.details,
        },
        voiceOver: {
          en: sellVillaSteps.activities[0].description,
          ru: await translateText(sellVillaSteps.activities[0].description, "ru"),
          zh: await translateText(sellVillaSteps.activities[0].description, "zh"),
        },
      })),
    );
    console.log(JSON.stringify(stepsData, null, 2), "stepsData");

    // Генерация английской версии
    const englishImages = await generateImagesForNeuroBroker(stepsData, "en", false);
    console.log(englishImages, "englishImages");

    const ownerImage = await generateImageNeuroBroker("Photograph, man, model pose, minimalist, beard, profound gaze, solid white environment, studio lights setting");
    console.log(ownerImage, "ownerImage");
    // // Создаем группу медиа для отправки изображений
    // const englishImages = [
    //   {
    //     imagePath: '/Users/playra/neuro-coder/src/images/output_step_Step 1.png',
    //     text: ''
    //   },
    //   {
    //     imagePath: '/Users/playra/neuro-coder/src/images/output_step_Step 2.png',
    //     text: ''
    //   },
    //   {
    //     imagePath: '/Users/playra/neuro-coder/src/images/output_step_Step 3.png',
    //     text: ''
    //   },
    //   {
    //     imagePath: '/Users/playra/neuro-coder/src/images/output_step_Step 4.png',
    //     text: ''
    //   },
    //   {
    //     imagePath: '/Users/playra/neuro-coder/src/images/output_step_Step 5.png',
    //     text: ''
    //   },
    //   {
    //     imagePath: '/Users/playra/neuro-coder/src/images/output_step_Step 6.png',
    //     text: ''
    //   },
    // ]

    const newArray = [...englishImages, ...ownerImage]
    console.log(newArray, "newArray");

    const englishMediaGroup: InputMediaPhoto[] = newArray.map((image) => ({
      type: "photo",
      media: new InputFile(image.imagePath),
      caption: image.text,
    }));
    // Отправляем группу изображений пользователю
    await ctx.replyWithMediaGroup(englishMediaGroup);


    
    
    const images = newArray.map((img) => img.imagePath)
    console.log(images,'images')

    const options: SlideshowOptions = {
      imageOptions: {
          imageResizeDimensions: {
              // width will be calculated according to the resulting aspect ratio
              height: 630
          },
          lastImageExtraDuration: 1000
      },
      loopingOptions: {
          loopImages: 'auto',
          loopAudio: 'auto'
      },
      ffmpegOptions: {
          streamCopyAudio: true
      },
      outputOptions: {
          outputDir: 'src/videos'
      }
  };

  const audioFile1 = `../audio/audio${1}.mp3`;
  // const voices = await elevenlabs.voices.getAll();
  // console.log(voices, 'voices')
  const audioStream2 = await createAudioFileFromText(stepsData[0].voiceOver.zh)
  console.log(audioStream2, 'audioStream2')

  const mergedAudioFile = 'src/audio/ledov/mergedAudioFile.mp3'
  await mergeAudioFiles(audioFile1, audioStream2, mergedAudioFile);
 
    const englishOutput: Partial<SlideshowResponse> = await createSlideshowVideo(
      images,
      mergedAudioFile,
      options
    );
    
    try {
      if (englishOutput && englishOutput.filePath) {
        console.log("File path:", englishOutput.filePath);
        await ctx.replyWithVideo(new InputFile(englishOutput.filePath), {
          caption: "Video EN NeuroBroker",
        });
        if (!ctx.from) throw new Error("No user");
        const fileName = `${ctx.from.id}_${Date.now()}.mp4`;
        await uploadVideo(englishOutput.filePath, ctx.from.id.toString(), "neuro_broker", fileName);
        const videoUrl = await getVideoUrl("neuro_broker", fileName);
        if (!videoUrl) throw new Error("No video url");
        const render = await createRender({ template_id: "10f7cf9f-9c44-479b-ad65-ea8b9242ccb1", modifications: { "Video-1": videoUrl } });
        console.log(render, "render");
        //await setHistory("neuro_broker", "Video EN NeuroBroker", videoUrl, "neuro_broker", "video");
        await ctx.reply("Video creation finished");
        return
    
      } else {
        console.error("File path is undefined. Please check the input parameters and ensure the video was created successfully.");
      }
    } catch (error) {
      console.error("Error creating slideshow video:", error);
    }
    // // Генерация испанской версии
    // const spanishImages = await generateImagesForMeditation(stepsData, "es");

    // // Создаем группу медиа для отправки изображений
    // const spanishMediaGroup: InputMediaPhoto[] = spanishImages.map((image) => ({
    //   type: "photo",
    //   media: new InputFile(image.imagePath),
    //   caption: image.text,
    // }));

    // await ctx.replyWithMediaGroup(spanishMediaGroup);

    // const spanishOutputPath = await createSlideshow(
    //   spanishImages.map((img) => img.imagePath),
    //   `src/audio/audio${numberTrack}.mp3`,
    //   "output_es.mp4",
    // );

    // // Ждем 1 секунду после создания слайд-шоу
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // await ctx.replyWithVideo(new InputFile(spanishOutputPath), {
    //   caption: "Video ES meditation",
    // });

    // Удаляем временные файлы
    // await fs.unlink(englishOutputPath);
    // await fs.unlink(spanishOutputPath);
    // for (const image of englishImages) {
    //   await fs.unlink(image.imagePath);
    // }
    // for (const image of spanishImages) {
    //   await fs.unlink(image.imagePath);
    // }
    return;
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error;
  }
};

export default neuro_broker;

// async function testSlideshow() {
//     const imageDir = path.join(process.cwd(), "src", "images");
//     const images = [
//         path.join(imageDir, "slide-Step 1.png"),
//         path.join(imageDir, "slide-Step 2.png"),
//         path.join(imageDir, "slide-Step 3.png"),
//         path.join(imageDir, "slide-Step 4.png"),
//     ];
//     const outputPath = path.join(imageDir, "test-slideshow.mp4");

//     try {
//         console.log("Starting slideshow creation...");
//         await createSlideshow(images, outputPath);
//         console.log(`Slideshow created successfully at: ${outputPath}`);
//     } catch (error) {
//         console.error("Error creating slideshow:", error);
//     }
// }

// testSlideshow();


// async function testSlideshow() {
//   const imageDir = path.join(process.cwd(), "src", "images");
//   const images = [
//     path.join(imageDir, "slide-Step 1.png"),
//     path.join(imageDir, "slide-Step 2.png"),
//     path.join(imageDir, "slide-Step 3.png"),
//     path.join(imageDir, "slide-Step 4.png"),
//   ];
//   const outputPath = path.join(imageDir, "test-slideshow.mp4");

//   try {
//     console.log("Starting slideshow creation...");
//     await createSlideshow(images, "src/audio/audio.mp3", outputPath);
//     console.log(`Slideshow created successfully at: ${outputPath}`);
//   } catch (error) {
//     console.error("Error creating slideshow:", error);
//   }
// }

// testSlideshow();

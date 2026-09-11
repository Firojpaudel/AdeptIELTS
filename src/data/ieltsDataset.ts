import { Question, Lesson, VocabularyCard, LearningResource, IELTSBook } from '../lib/types';

// ============================================================================
// 1. AUTHENTIC IELTS READING PASSAGES & QUESTION SETS
// ============================================================================

export const READING_PASSAGE_1 = {
  id: 'passage-urban-microclimates',
  title: 'The Architecture of Urban Microclimates',
  text: `As global metropolitan areas expand, cities increasingly generate their own distinctive localized atmospheric conditions, commonly termed urban heat islands (UHIs). Surface temperatures in densely built environments can exceed surrounding rural hinterlands by as much as 8°C during peak summer months. This thermal discrepancy is primarily attributed to the ubiquitous deployment of low-albedo materials such as asphalt and concrete, coupled with the geometrical confinement of 'street canyons' that entrap outgoing longwave radiation.

In response, contemporary architectural urbanists are pioneering microclimate engineering. By calculating the sky view factor (SVF)—the proportion of visible sky unshielded by urban structures—planners can modulate natural ventilation corridors. Studies conducted in Singapore and Stuttgart illustrate that strategically aligning arterial boulevards with prevailing synoptic wind patterns dramatically accelerates sensible heat dispersal.

Furthermore, vegetative retrofitting via intensive green roofs and bioswales plays an indispensable role. Transpiration from urban canopy trees converts substantial solar irradiation into latent heat rather than sensible heat, directly mitigating ambient temperature spikes. However, municipal authorities frequently encounter structural constraints: older building inventories often lack the load-bearing capacities required for substrate soils and rainwater retention basins. Consequently, aerodynamic passive cooling and high-reflectance titanium dioxide coatings present more immediate, retrofittable interventions for legacy urban cores.`,
};

export const READING_PASSAGE_2 = {
  id: 'passage-marine-acoustics',
  title: 'Vocal Culture and Transmission in Cetaceans',
  text: `Scientific consensus historically reserved cumulative cultural transmission—the social transfer of behavioral repertoires across generations—exclusively for hominids. Over the past three decades, however, continuous hydrophone tracking of delphinids, notably Orcinus orca and Megaptera novaeangliae (humpback whales), has definitively disproven this anthropocentric dogma.

Killer whale pods inhabit distinct matrilineal social groupings characterized by highly stereotyped vocal dialects. Rather than being genetically determined at birth, these acoustic repertoires are acquired by calves through intensive vocal imitation of older matriarchs. In the coastal fjords of Norway and the Pacific Northwest, sympatric resident and transient pods share identical habitats yet exhibit mutually unintelligible acoustic signatures. This acoustic segregation prevents inter-clan cross-breeding and serves as an immutable cultural boundary.

More remarkably, humpback whale acoustic displays demonstrate rapid horizontal transmission on an oceanic scale. Male humpbacks across the South Pacific synchronize their breeding melodies annually. When a pod introduces a revolutionary motif or phrase sequence, adjacent populations assimilate and modify the acoustic pattern across thousands of nautical miles within a single mating season. Such rapid cultural revolutions represent the fastest known cultural shifts observed in the non-human animal kingdom.`,
};

export const READING_PASSAGE_3 = {
  id: 'passage-chronometer-navigation',
  title: 'The Evolution of Marine Chronometers and Maritime Longitude',
  text: `Until the mid-eighteenth century, oceanic seafaring was plagued by a catastrophic navigational blind spot: sailors could determine their latitude with celestial sextants, but determining longitude remained mathematically elusive. The British Parliament's Longitude Act of 1714 offered a colossal prize of £20,000 to anyone who could determine longitude at sea to within half a degree of arc during a voyage to the West Indies.

The scientific establishment, spearheaded by Astronomer Royal Nevil Maskelyne, championed the 'lunar distance' method. This technique relied on cataloging the precise position of the Moon against background stellar constellations—an operation requiring intricate spherical trigonometry and extensive astronomical tables, nearly impossible on rolling seas in foul weather.

Conversely, an uneducated Yorkshire carpenter and clockmaker named John Harrison proposed a mechanical solution: an ultra-precise portable sea clock that could maintain Greenwich Mean Time throughout a multi-month transatlantic journey. Comparing Greenwich time with local solar noon would yield precise longitude (each hour of difference equaling exactly 15 degrees of longitude). Harrison devoted four decades to inventing temperature-compensated bimetallic strips and friction-reducing caged ball bearings, culminating in his masterpiece, the H4 pocket watch in 1761. In rigorous sea trials to Jamaica, the H4 lost merely 5.1 seconds over 81 days, decisively outperforming lunar astronomy and permanently securing modern maritime cartography.`,
};

export const READING_PASSAGE_GT_1 = {
  id: 'passage-workplace-ergonomics',
  title: 'Occupational Health and Workplace Ergonomics Guidelines',
  text: `All personnel operating computer display terminals for more than three continuous hours daily are entitled under health and safety regulations to an ergonomic workstation assessment. Display screens must be positioned directly in front of the operator, with the top of the monitor level with or slightly below eye height. The recommended viewing distance between the user's eyes and the screen surface ranges between 50 and 70 centimeters.

Chairs must possess five-star swivel bases, height adjustability, and a dynamic lumbar support mechanism that adapts to the curvature of the lower spine. Feet should rest flat upon the floor; where desk heights cannot be mechanically altered, adjustable footrests must be requisitioned via Departmental Facility Coordinators. Furthermore, operators are mandated to integrate micro-breaks consisting of 20-second gaze shifts toward objects at least 6 meters distant every 20 minutes to alleviate digital eye strain.`,
};

export const IELTS_QUESTIONS: Question[] = [
  {
    id: 'q-u-1',
    skill: 'reading',
    subskill: 'true_false_not_given',
    questionType: 'true_false_not_given',
    testType: 'academic',
    difficulty: 'intermediate',
    targetBand: 6.5,
    topic: 'Environment & Urban Planning',
    passageId: READING_PASSAGE_1.id,
    passageTitle: READING_PASSAGE_1.title,
    passageText: READING_PASSAGE_1.text,
    prompt: 'Surface temperatures in cities can be up to 8°C warmer than nearby countryside areas in summer.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    correctAnswer: 'TRUE',
    evidenceSpan: 'Surface temperatures in densely built environments can exceed surrounding rural hinterlands by as much as 8°C during peak summer months.',
    explanation: 'The passage explicitly states that urban surface temperatures can exceed surrounding rural areas by as much as 8°C during summer, directly verifying TRUE.',
  },
  {
    id: 'q-u-2',
    skill: 'reading',
    subskill: 'true_false_not_given',
    questionType: 'true_false_not_given',
    testType: 'academic',
    difficulty: 'upper_intermediate',
    targetBand: 7.0,
    topic: 'Environment & Urban Planning',
    passageId: READING_PASSAGE_1.id,
    passageTitle: READING_PASSAGE_1.title,
    passageText: READING_PASSAGE_1.text,
    prompt: 'Older urban buildings are universally being demolished to make way for intensive green roofs.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    correctAnswer: 'FALSE',
    evidenceSpan: 'older building inventories often lack the load-bearing capacities required for substrate soils... Consequently, aerodynamic passive cooling and high-reflectance titanium dioxide coatings present more immediate, retrofittable interventions for legacy urban cores.',
    explanation: 'The text states older buildings face structural load limits and instead use retrofittable coatings; they are NOT being universally demolished. Hence FALSE.',
  },
  {
    id: 'q-u-3',
    skill: 'reading',
    subskill: 'true_false_not_given',
    questionType: 'true_false_not_given',
    testType: 'academic',
    difficulty: 'advanced',
    targetBand: 7.5,
    topic: 'Environment & Urban Planning',
    passageId: READING_PASSAGE_1.id,
    passageTitle: READING_PASSAGE_1.title,
    passageText: READING_PASSAGE_1.text,
    prompt: 'Stuttgart experienced greater temperature reductions than Singapore following boulevard realignment.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    correctAnswer: 'NOT GIVEN',
    evidenceSpan: 'Studies conducted in Singapore and Stuttgart illustrate that strategically aligning arterial boulevards with prevailing synoptic wind patterns dramatically accelerates sensible heat dispersal.',
    explanation: 'The passage mentions studies in both Singapore and Stuttgart, but never compares which city achieved greater temperature reductions. Thus NOT GIVEN.',
  },
  {
    id: 'q-u-4',
    skill: 'reading',
    subskill: 'sentence_completion',
    questionType: 'sentence_completion',
    testType: 'academic',
    difficulty: 'intermediate',
    targetBand: 6.5,
    topic: 'Environment & Urban Planning',
    passageId: READING_PASSAGE_1.id,
    passageTitle: READING_PASSAGE_1.title,
    passageText: READING_PASSAGE_1.text,
    prompt: 'Complete the sentence with NO MORE THAN TWO WORDS from the passage: Outgoing longwave radiation is entrapped by the geometry of ________.',
    correctAnswer: 'street canyons',
    evidenceSpan: 'coupled with the geometrical confinement of \'street canyons\' that entrap outgoing longwave radiation.',
    explanation: 'Exact scanning for "entrap outgoing longwave radiation" pinpoints the geometrical confinement of "street canyons".',
  },
  {
    id: 'q-m-1',
    skill: 'reading',
    subskill: 'multiple_choice',
    questionType: 'multiple_choice',
    testType: 'academic',
    difficulty: 'upper_intermediate',
    targetBand: 7.0,
    topic: 'Biology & Animal Communication',
    passageId: READING_PASSAGE_2.id,
    passageTitle: READING_PASSAGE_2.title,
    passageText: READING_PASSAGE_2.text,
    prompt: 'According to paragraph 2, killer whale vocal dialects are primarily:',
    options: [
      'Inborn acoustic traits encoded in their genome',
      'Learned behaviors passed down through imitation of matriarchs',
      'Random vocalizations with no cultural boundaries',
      'Shared universally across all pods living in the same fjord',
    ],
    correctAnswer: 'Learned behaviors passed down through imitation of matriarchs',
    evidenceSpan: 'Rather than being genetically determined at birth, these acoustic repertoires are acquired by calves through intensive vocal imitation of older matriarchs.',
    explanation: 'The text clearly states calves acquire acoustic repertoires through imitation of older matriarchs, establishing cultural transmission.',
  },
  {
    id: 'q-m-2',
    skill: 'reading',
    subskill: 'true_false_not_given',
    questionType: 'true_false_not_given',
    testType: 'academic',
    difficulty: 'advanced',
    targetBand: 8.0,
    topic: 'Biology & Animal Communication',
    passageId: READING_PASSAGE_2.id,
    passageTitle: READING_PASSAGE_2.title,
    passageText: READING_PASSAGE_2.text,
    prompt: 'Humpback whale breeding songs remain identical across consecutive decades.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    correctAnswer: 'FALSE',
    evidenceSpan: 'Male humpbacks across the South Pacific synchronize their breeding melodies annually. When a pod introduces a revolutionary motif... adjacent populations assimilate and modify the acoustic pattern across thousands of nautical miles within a single mating season.',
    explanation: 'The passage highlights rapid horizontal revolutions where songs change annually and spread across miles within a single season, contradicting that they remain identical across decades. Hence FALSE.',
  },
  {
    id: 'q-c-1',
    skill: 'reading',
    subskill: 'multiple_choice',
    questionType: 'multiple_choice',
    testType: 'academic',
    difficulty: 'advanced',
    targetBand: 7.5,
    topic: 'History of Science & Technology',
    passageId: READING_PASSAGE_3.id,
    passageTitle: READING_PASSAGE_3.title,
    passageText: READING_PASSAGE_3.text,
    prompt: 'The lunar distance method advocated by Nevil Maskelyne was criticized because:',
    options: [
      'It could only be performed when the Moon was completely full',
      'It required mathematical calculations that were excessively difficult on rough seas',
      'It was significantly more costly than building marine timepieces',
      'It failed to account for Greenwich Mean Time',
    ],
    correctAnswer: 'It required mathematical calculations that were excessively difficult on rough seas',
    evidenceSpan: 'requiring intricate spherical trigonometry and extensive astronomical tables, nearly impossible on rolling seas in foul weather.',
    explanation: 'The text directly notes that spherical trigonometry and tables were nearly impossible on rolling seas in foul weather.',
  },
  {
    id: 'q-c-2',
    skill: 'reading',
    subskill: 'sentence_completion',
    questionType: 'sentence_completion',
    testType: 'academic',
    difficulty: 'intermediate',
    targetBand: 6.5,
    topic: 'History of Science & Technology',
    passageId: READING_PASSAGE_3.id,
    passageTitle: READING_PASSAGE_3.title,
    passageText: READING_PASSAGE_3.text,
    prompt: 'Complete with ONE WORD OR A NUMBER: In nautical navigation, every hour of time difference from Greenwich equals exactly ________ degrees of longitude.',
    correctAnswer: '15',
    evidenceSpan: 'Comparing Greenwich time with local solar noon would yield precise longitude (each hour of difference equaling exactly 15 degrees of longitude).',
    explanation: 'The passage states: "each hour of difference equaling exactly 15 degrees of longitude".',
  },
  {
    id: 'q-gt-1',
    skill: 'reading',
    subskill: 'true_false_not_given',
    questionType: 'true_false_not_given',
    testType: 'general',
    difficulty: 'intermediate',
    targetBand: 6.0,
    topic: 'Workplace Regulations',
    passageId: READING_PASSAGE_GT_1.id,
    passageTitle: READING_PASSAGE_GT_1.title,
    passageText: READING_PASSAGE_GT_1.text,
    prompt: 'Employees who use computer screens for two hours per day are legally required to undergo an ergonomic assessment.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    correctAnswer: 'FALSE',
    evidenceSpan: 'All personnel operating computer display terminals for more than three continuous hours daily are entitled under health and safety regulations to an ergonomic workstation assessment.',
    explanation: 'The assessment applies to those operating screens for MORE than three continuous hours, not two hours.',
  },
];

// ============================================================================
// 2. AUTHENTIC IELTS WRITING PROMPTS
// ============================================================================

export const IELTS_WRITING_PROMPTS = [
  {
    id: 'w-task2-ai-workplace',
    taskType: 'task2' as const,
    title: 'Artificial Intelligence and Workplace Automation',
    prompt: `Some people believe that artificial intelligence and automation will eliminate the majority of white-collar professional jobs within the next two decades, while others argue that AI will primarily augment human productivity and generate new employment sectors.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.`,
    promptText: `Some people believe that artificial intelligence and automation will eliminate the majority of white-collar professional jobs within the next two decades, while others argue that AI will primarily augment human productivity and generate new employment sectors.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.`,
    timeMinutes: 40,
    minWords: 250,
    recommendedBand: 7.5,
    category: 'Technology & Employment',
  },
  {
    id: 'w-task1-renewables',
    taskType: 'task1' as const,
    title: 'European Renewable Energy Generation (2010–2024)',
    prompt: `The line graph below illustrates the percentage of total electricity generated from renewable sources (wind, solar, and hydroelectric) across four European countries—Germany, Spain, Denmark, and the United Kingdom—between 2010 and 2024.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    promptText: `The line graph below illustrates the percentage of total electricity generated from renewable sources (wind, solar, and hydroelectric) across four European countries—Germany, Spain, Denmark, and the United Kingdom—between 2010 and 2024.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    timeMinutes: 20,
    minWords: 150,
    recommendedBand: 7.0,
    category: 'Energy & Environment',
  },
  {
    id: 'w-task1-gt-tenancy',
    taskType: 'task1' as const,
    title: 'Formal Letter: Rental Property Maintenance Grievance',
    prompt: `You recently moved into a rented apartment and discovered several recurring maintenance issues that your property manager has failed to address despite previous phone calls.

Write a formal letter to the director of the property management company. In your letter:
- introduce yourself and state the property address
- describe the specific maintenance problems and their impact on your living conditions
- state clearly what actions you expect the company to take and give a reasonable deadline.

Write at least 150 words. You do NOT need to write any addresses. Begin your letter with: "Dear Sir or Madam,"`,
    promptText: `You recently moved into a rented apartment and discovered several recurring maintenance issues that your property manager has failed to address despite previous phone calls.

Write a formal letter to the director of the property management company. In your letter:
- introduce yourself and state the property address
- describe the specific maintenance problems and their impact on your living conditions
- state clearly what actions you expect the company to take and give a reasonable deadline.

Write at least 150 words. You do NOT need to write any addresses. Begin your letter with: "Dear Sir or Madam,"`,
    timeMinutes: 20,
    minWords: 150,
    recommendedBand: 6.5,
    category: 'General Training Correspondence',
  },
];

// ============================================================================
// 3. AUTHENTIC IELTS SPEAKING INTERVIEW SESSIONS
// ============================================================================

export const IELTS_SPEAKING_TESTS = [
  {
    id: 'spk-part2-urban-park',
    part: 2 as const,
    topic: 'Urban Spaces and Public Parks',
    prompt: 'Describe a public park or green open space in your city that you enjoy visiting.',
    bulletPoints: [
      'Where this park or green space is situated',
      'What features, flora, or recreational amenities it contains',
      'How frequently and with whom you visit it',
      'And explain why you consider this open space significant for the local community.',
    ],
    prepSeconds: 60,
    preparationSeconds: 60,
    talkSeconds: 120,
    speakingSeconds: 120,
    part3FollowUps: [
      'Do you think local municipal governments invest adequately in urban park infrastructure?',
      'How does access to nature in densely populated cities influence public mental well-being?',
      'Should commercial activities like open-air markets and cafes be permitted inside nature sanctuaries?',
    ],
  },
  {
    id: 'spk-part2-technology',
    part: 2 as const,
    topic: 'Technological Innovation & Daily Habits',
    prompt: 'Describe an electronic device or software application that significantly altered how you manage your daily responsibilities.',
    bulletPoints: [
      'What the device or application is and when you adopted it',
      'How frequently you utilize it during a typical week',
      'What specific operations or tasks it streamlines',
      'And explain whether you believe it has improved or compromised your overall productivity.',
    ],
    prepSeconds: 60,
    preparationSeconds: 60,
    talkSeconds: 120,
    speakingSeconds: 120,
    part3FollowUps: [
      'In what ways has digital automation affected interpersonal communication in the workplace?',
      'Do you anticipate that future generations will depend excessively on automated assistance?',
    ],
  },
];

export const IELTS_SPEAKING_PROMPTS = IELTS_SPEAKING_TESTS;
export const MOCK_SPEAKING_PROMPTS = IELTS_SPEAKING_TESTS;

// ============================================================================
// 4. AUTHENTIC ACADEMIC WORD LIST (AWL) VOCABULARY
// ============================================================================

export const IELTS_VOCABULARY: VocabularyCard[] = [
  {
    id: 'awl-analyze',
    word: 'analyze',
    phonetic: '/ˈæn.əl.aɪz/',
    partOfSpeech: 'verb',
    definition: 'To examine methodically and in detail the constitution or structure of something to explain and interpret it.',
    collocations: ['analyze empirical data', 'statistically analyze', 'thoroughly analyze findings'],
    ieltsContext: 'Researchers must rigorously analyze qualitative survey data before publishing definitive policy conclusions.',
    topic: 'Academic Inquiry & Research',
    targetBand: 7.0,
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'awl-constitute',
    word: 'constitute',
    phonetic: '/ˈkɒn.stɪ.tʃuːt/',
    partOfSpeech: 'verb',
    definition: 'To be a part of a whole; to establish or formulate a legal, physical, or conceptual structure.',
    collocations: ['constitute a major threat', 'constitute a significant proportion', 'constitute evidence'],
    ieltsContext: 'Renewable power sources now constitute over forty percent of national energy output in several European nations.',
    topic: 'Environment & Policy',
    targetBand: 7.5,
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'awl-correlation',
    word: 'correlation',
    phonetic: '/ˌkɒr.əˈleɪ.ʃən/',
    partOfSpeech: 'noun',
    definition: 'A mutual relationship or connection between two or more things, variables, or statistical observations.',
    collocations: ['strong positive correlation', 'inverse correlation', 'establish a correlation between'],
    ieltsContext: 'Epidemiological studies indicate a profound positive correlation between particulate matter inhalation and cardiovascular ailments.',
    topic: 'Health & Science',
    targetBand: 7.5,
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'awl-disparity',
    word: 'disparity',
    phonetic: '/dɪˈspær.ə.ti/',
    partOfSpeech: 'noun',
    definition: 'A great difference or inequality between groups, numbers, or treatment.',
    collocations: ['economic disparity', 'growing disparity', 'regional disparities in funding'],
    ieltsContext: 'The educational disparity between rural communities and urban centers remains a formidable obstacle to equitable development.',
    topic: 'Society & Economics',
    targetBand: 8.0,
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'awl-mitigate',
    word: 'mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
    partOfSpeech: 'verb',
    definition: 'To make something bad or harmful less severe, serious, or painful.',
    collocations: ['mitigate environmental impact', 'mitigate the risks', 'measures designed to mitigate'],
    ieltsContext: 'Urban forestry programs serve to mitigate the adverse effects of thermal heat islands in tropical cities.',
    topic: 'Urban Planning & Environment',
    targetBand: 7.5,
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'awl-unprecedented',
    word: 'unprecedented',
    phonetic: '/ʌnˈpres.ɪ.den.tɪd/',
    partOfSpeech: 'adjective',
    definition: 'Never done or known before; extraordinary in scale or frequency.',
    collocations: ['unprecedented global scale', 'at an unprecedented rate', 'unprecedented economic growth'],
    ieltsContext: 'The transition toward generative artificial intelligence is proceeding at an unprecedented pace across white-collar industries.',
    topic: 'Technology & Future',
    targetBand: 8.0,
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'awl-feasible',
    word: 'feasible',
    phonetic: '/ˈfiː.zə.bəl/',
    partOfSpeech: 'adjective',
    definition: 'Possible to do easily or conveniently; workable in practice.',
    collocations: ['economically feasible', 'technically feasible solution', 'viable and feasible'],
    ieltsContext: 'Transitioning entirely to carbon-neutral aviation fuel remains technically feasible, though economically prohibitive in the short term.',
    topic: 'Industry & Economics',
    targetBand: 7.0,
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'awl-subsequent',
    word: 'subsequent',
    phonetic: '/ˈsʌb.sɪ.kwənt/',
    partOfSpeech: 'adjective',
    definition: 'Coming after something in time; following as a result or chronological progression.',
    collocations: ['in subsequent years', 'subsequent investigation', 'subsequent generation'],
    ieltsContext: 'The initial failure of the experiment prompted substantial methodology revisions in subsequent trials.',
    topic: 'Scientific Methodology',
    targetBand: 6.5,
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
];

// ============================================================================
// 5. AUTHENTIC CURATED IELTS LEARNING RESOURCES (MASTER LIST)
// ============================================================================

export const IELTS_RESOURCES: LearningResource[] = [
  {
    id: 'res-ielts-org-prep',
    title: 'IELTS Official Preparation Resources & Rubrics',
    provider: 'IELTS.org (Official Cambridge / British Council / IDP)',
    url: 'https://ielts.org/take-a-test/preparation-resources',
    skill: 'all',
    level: 'All Bands (1.0–9.0)',
    type: 'Official Assessment Blueprint',
    authority: 'official',
    usageMode: 'licensed_content',
    readingTimeMinutes: 8,
    description: 'The primary official preparation guide detailing band calculation formulas, negative marking rules, and official 4-criterion assessment rubrics.',
    verifiedFree: true,
    fullGuide: {
      summary: 'A complete walkthrough of the official scoring methodology, raw-to-band conversion metrics, and the four official examiner criteria across Academic & General modules.',
      sections: [
        {
          title: 'Official Band Score Calculation & Rounding Rules',
          content: [
            'Your overall IELTS band score is the arithmetic mean of the four individual module scores (Listening, Reading, Writing, Speaking), rounded to the nearest half or whole band.',
            'Rounding Rule 1: If the average ends in .25, it rounds UP to the next half band. For example: 6.5, 6.5, 7.0, 6.0 gives 26.0 / 4 = 6.5. If the total was 26.5 / 4 = 6.625, it rounds UP to 6.5 or 6.75 rounds UP to 7.0.',
            'Rounding Rule 2: If the average ends in .75, it rounds UP to the next whole band. For example, 6.5, 7.0, 7.0, 7.5 gives 28.0 / 4 = 7.0. If the average is 6.75, it rounds UP to Band 7.0.',
            'There is strictly ZERO negative marking in IELTS Listening and Reading. Never leave any answer blank—always enter your best logical deduction.'
          ],
          callout: 'Raw Score Benchmark: In Academic Reading and Listening, achieving 30/40 correct secures Band 7.0, while 35/40 secures Band 8.0.',
          keyRules: [
            'Listening: 30 minutes audio + 10 minutes transfer (Paper) or 2 minutes review (Computer).',
            'Reading: 60 minutes strictly without extra transfer time for 3 passages and 40 questions.',
            'Writing: 60 minutes for Task 1 (recommended 20m, 150 words) and Task 2 (recommended 40m, 250 words).'
          ]
        },
        {
          title: 'The Four Universal Assessment Criteria',
          content: [
            'Writing Task 2 is evaluated across: 1. Task Response (25%), 2. Coherence & Cohesion (25%), 3. Lexical Resource (25%), and 4. Grammatical Range & Accuracy (25%).',
            'Speaking is evaluated across: 1. Fluency & Coherence (25%), 2. Lexical Resource (25%), 3. Grammatical Range & Accuracy (25%), and 4. Pronunciation (25%).',
            'To achieve Band 8.0 in Lexical Resource, candidates must skillfully use uncommon lexical items and show fluency in the use of collocation and nuance.'
          ],
          examples: [
            'Weak: "A lot of people think pollution is very bad." (Band 5.5)',
            'Strong: "A substantial proportion of the populace contends that pervasive atmospheric contamination exerts detrimental ramifications." (Band 8.5)'
          ]
        }
      ],
      actionChecklist: [
        'Review the official Band 7.0 and 8.0 public band descriptors before beginning timed practice.',
        'Adopt the 20-minute / 40-minute disciplined time-split for Writing.',
        'Always answer every single multiple-choice and completion item, as wrong answers carry no penalty.'
      ]
    }
  },
  {
    id: 'res-ielts-org-sample-tests',
    title: 'IELTS Official Sample Test Questions & Strategies',
    provider: 'IELTS.org',
    url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions',
    skill: 'reading',
    level: 'All Bands',
    type: 'Question Type Masterclass',
    authority: 'official',
    usageMode: 'licensed_content',
    readingTimeMinutes: 10,
    description: 'Systematic tactical breakdowns of all 14 Reading & Listening question types including TFNG, Matching Headings, and Summary Completion.',
    verifiedFree: true,
    fullGuide: {
      summary: 'Step-by-step answering workflows for the 14 official question types, designed to stop time wastage and eliminate common examiner traps.',
      sections: [
        {
          title: 'Mastering True / False / Not Given (TFNG)',
          content: [
            'TRUE: The passage directly confirms the statement factually or through precise synonyms.',
            'FALSE: The passage directly contradicts the statement with opposing facts or exclusionary language.',
            'NOT GIVEN: The passage mentions the topic, but does not provide enough factual certainty to prove or disprove the specific claim.',
            'Examiner Trap: Candidates frequently confuse FALSE with NOT GIVEN. If the passage says "The event occurred in 1984" and statement says "The event took place in 1990", it is FALSE. If the passage says "The event occurred in spring" and statement says "It was the warmest spring on record", it is NOT GIVEN.'
          ],
          callout: 'Rule of Thumb: If you have to make an assumption or mental jump to make the statement true, it is NOT GIVEN.',
          keyRules: [
            'Pay immediate attention to qualifiers: always, predominantly, occasionally, improbable, universal.',
            'Do not bring outside personal knowledge into the exam hall; score based solely on what is printed on the page.'
          ]
        },
        {
          title: 'Matching Headings: The 2-Pass Method',
          content: [
            'Do Matching Headings questions FIRST before answering any detailed or specific question types for that passage.',
            'Pass 1: Read the headings list and underline the operative keywords (nouns, qualifying adjectives).',
            'Pass 2: Read the first 2 sentences and final sentence of each paragraph to identify the macro-idea (topic sentence), then match.'
          ]
        }
      ],
      actionChecklist: [
        'Practice identifying the difference between contradictory claims and absent claims.',
        'Never read an entire 900-word passage word-for-word before inspecting the questions.',
        'Underline operational keywords in questions prior to skimming the text.'
      ]
    }
  },
  {
    id: 'res-bc-take-ielts',
    title: 'Computer-Delivered IELTS (CD-IELTS) Mastery Guide',
    provider: 'British Council',
    url: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests',
    skill: 'all',
    level: 'All Bands',
    type: 'Digital Exam Ergonomics',
    authority: 'official_provider',
    usageMode: 'licensed_content',
    readingTimeMinutes: 7,
    description: 'Complete operational guide for computer-delivered IELTS: screen shortcuts, highlighting text, real-time word counting, and keyboard ergonomics.',
    verifiedFree: true,
    fullGuide: {
      summary: 'Tactical advantages of taking IELTS on computer: instant editing, real-time word count displays, split-screen text viewing, and automated navigation.',
      sections: [
        {
          title: 'Screen Controls & Functional Shortcuts',
          content: [
            'Highlight Tool: Click and drag over any text span in the reading passage or listening prompt, right-click and choose "Highlight". This stays visible across the whole test.',
            'Notes Feature: Highlight text, right-click and select "Notes". A yellow notepad appears where you can type quick memory cues.',
            'Navigation Bar: The bottom of the screen displays numbered buttons for all questions. Unanswered questions appear with an outline; answered questions turn solid; flagged questions have a banner.',
            'Review Button: Press the "Review" toggle on any challenging item to return to it before the timer runs out.'
          ],
          callout: 'Writing Word Count: The computer screen features an automatic real-time word counter below your text box. You never need to count lines or words manually.'
        },
        {
          title: 'Typing and Editing Speed Advantages',
          content: [
            'Standard shortcuts Ctrl+C (Copy), Ctrl+V (Paste), and Ctrl+X (Cut) are fully supported in the writing module.',
            'Candidates who type at 35+ words per minute typically gain 8-10 minutes of pure proofreading time compared to paper test-takers.',
            'Spelling check is strictly DISABLED in the official exam interface; ensure you reserve 4 minutes at the end of each task for manual proofreading.'
          ]
        }
      ],
      actionChecklist: [
        'Practice with an external keyboard to develop comfort with rapid typing without spellcheck.',
        'Use the bottom question bar to verify that all 40 questions have been answered prior to submission.',
        'Utilize the highlight function for matching-headings keyword tracking.'
      ]
    }
  },
  {
    id: 'res-cambridge-sample-papers',
    title: 'Cambridge Band 9.0 Writing Vault & Model Essays',
    provider: 'Cambridge Assessment English',
    url: 'https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/',
    skill: 'writing',
    level: 'Band 7.5–9.0',
    type: 'Examiner-Annotated Model Answers',
    authority: 'official',
    usageMode: 'licensed_content',
    readingTimeMinutes: 12,
    description: 'Official Cambridge model answers with examiner commentary, structural blueprints for Task 1 reports, and Band 9 discursive essays.',
    verifiedFree: true,
    fullGuide: {
      summary: 'Examiner-graded Band 9.0 Task 1 reports and Task 2 essays with comprehensive criterion-by-criterion analysis and actionable writing structures.',
      sections: [
        {
          title: 'Task 1: The Four-Paragraph Report Structure',
          content: [
            'Paragraph 1 - Introduction: Paraphrase the prompt title in one concise sentence (e.g. "The line graph illustrates the fluctuations in...").',
            'Paragraph 2 - The Overview: State 2-3 overall trends, highest/lowest points, or major anomalies. CRITICAL: Never include specific numerical data in the overview.',
            'Paragraph 3 - Specific Detail 1: Group related data points (e.g. categories showing upward trajectories) and cite exact figures, units, and dates.',
            'Paragraph 4 - Specific Detail 2: Report contrasting categories (e.g. declining or static figures) with accurate comparative syntax.'
          ],
          callout: 'Without a clear Overview paragraph, the maximum score achievable for Task Achievement is Band 5.0, regardless of vocabulary quality!'
        }
      ],
      modelAnswer: {
        prompt: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?',
        response: 'In contemporary pedagogical discourse, whether secondary educational curricula ought to mandate voluntary civic service remains contentious. While detractors contend that compulsory community work imposes an onerous burden on adolescents already confronted with rigorous academic demands, I firmly contend that integrating civic service into secondary education cultivates essential societal empathy and pragmatic life competencies.\n\nAdmittedly, adversaries argue that high school students frequently face elevated stress levels stemming from high-stakes standardized assessments and extracurricular obligations. In this context, mandating hours of unpaid community work could potentially precipitate burnout or detract from core academic pursuits. Furthermore, some critics assert that coercion diminishes the intrinsic altruistic virtue of voluntary work.\n\nNevertheless, the societal and psychological benefits of experiential civic involvement substantially eclipse these concerns. Firstly, participating in structured community service fosters civic responsibility and breaks through socio-economic bubbles. By volunteering at local eldercare facilities, environmental restoration initiatives, or food distribution hubs, adolescents develop emotional intelligence and a nuanced comprehension of broader systemic challenges that cannot be replicated within traditional classroom pedagogy.\n\nSecondly, civic involvement equips youths with pragmatic transferable capabilities. Managing volunteer shifts, coordinating logistical operations, and communicating with diverse demographic groups cultivates interpersonal aptitude and team problem-solving. In an increasingly competitive global labor market, universities and employers actively seek candidates demonstrating well-rounded civic awareness alongside academic credentials.\n\nIn conclusion, despite concerns regarding academic pressure, making community service a curriculum requirement yields profound developmental benefits. Educational authorities should therefore introduce well-structured service programmes that foster empathetic and proactive citizens.',
        examinerAnalysis: 'Task Response: Band 9.0. Clear position presented and sustained throughout; well-developed ideas with relevant nuance. Coherence & Cohesion: Band 9.0. Flawless paragraphing, sophisticated referencing, and logical progression. Lexical Resource: Band 9.0. Natural and sophisticated control of lexical items ("pedagogical discourse", "onerous burden", "altruistic virtue", "socio-economic bubbles"). Grammatical Range: Band 9.0. Wide range of complex structures executed with full flexibility and accuracy.'
      },
      actionChecklist: [
        'Ensure the Task 1 Overview is clearly identifiable as a standalone paragraph.',
        'Maintain your stance from the Introduction right through to the Conclusion in Task 2.',
        'Vary cohesive devices using pronouns, synonyms, and adverbial fronting.'
      ]
    }
  },
  {
    id: 'res-idp-prepare',
    title: 'IDP Speaking Interview 9.0 Masterclass',
    provider: 'IDP Education',
    url: 'https://ielts.idp.com/prepare',
    skill: 'speaking',
    level: 'Band 6.5–9.0',
    type: 'Oral Fluency Frameworks',
    authority: 'official_provider',
    usageMode: 'licensed_content',
    readingTimeMinutes: 9,
    description: 'Fluency frameworks for all 3 speaking parts: the Past-Present-Future (PPF) method, 1-minute cue card mind mapping, and PEEL abstract reasoning.',
    verifiedFree: true,
    fullGuide: {
      summary: 'Actionable speech delivery structures designed to eliminate hesitation, expand responses naturally, and achieve Band 8.0+ in Fluency & Coherence.',
      sections: [
        {
          title: 'Part 1: The PPF (Past-Present-Future) Formula',
          content: [
            'Never answer Part 1 questions with a monosyllabic "Yes" or "No".',
            'Answer the question directly, expand with your current habit (Present), contrast with how it was when you were younger (Past), or predict your future inclination (Future).',
            'Aim for 2 to 4 fluid sentences per question (15–25 seconds) without trailing off.'
          ],
          examples: [
            'Examiner: "Do you enjoy cooking?"',
            'Candidate: "To be honest, on weekdays I rarely find the time due to my demanding schedule (Present). However, back when I lived with my grandparents, we would frequently prepare traditional stews together from scratch (Past). Once I graduate, I definitely intend to take a professional culinary workshop (Future)."'
          ]
        },
        {
          title: 'Part 2: The 1-Minute Note-Taking Grid',
          content: [
            'During the 1 minute of preparation time, do NOT write full sentences. Draw a cross on your scratch paper dividing it into four quadrants:',
            'Quadrant 1: WHO / WHAT (Names, settings, context)',
            'Quadrant 2: WHERE / WHEN (Chronological anchor)',
            'Quadrant 3: WHAT HAPPENED (The central narrative conflict or action)',
            'Quadrant 4: WHY MEMORABLE / FEELINGS (Emotional reflection - this is where Band 8+ vocabulary lives!)'
          ],
          callout: 'Keep speaking until the examiner stops you at the 2-minute mark. Never stop prematurely at 1 minute 15 seconds!'
        },
        {
          title: 'Part 3: The PEEL Technique for Abstract Topics',
          content: [
            'Part 3 evaluates your ability to discuss ideas in the abstract rather than talking about yourself.',
            'P - Point: State your direct perspective clearly.',
            'E - Explain: Unpack the sociological, economic, or psychological cause.',
            'E - Example: Provide a representative real-world phenomenon or scenario.',
            'L - Link: Tie your point back to the broader societal question.'
          ]
        }
      ],
      actionChecklist: [
        'Avoid filler sounds (uh, um, ah) by using natural conversational discourse markers: "Well, frankly speaking...", "That is an intriguing question...".',
        'Use the 1-minute prep time in Part 2 strictly for vocabulary cues and story structure.',
        'Keep Part 3 answers focused on macro-society rather than personal anecdotes.'
      ]
    }
  },
  {
    id: 'res-awl-coxhead',
    title: 'Academic Word List (AWL) & High-Band Collocations',
    provider: 'Averil Coxhead (Victoria University of Wellington)',
    url: 'https://www.wgtn.ac.nz/lals/resources/academicwordlist',
    skill: 'vocabulary',
    level: 'Band 6.5–9.0',
    type: 'Lexical Corpus & Collocations',
    authority: 'trusted_education',
    usageMode: 'licensed_content',
    readingTimeMinutes: 11,
    description: 'The 570 headword families essential for academic excellence, categorized by IELTS topics with high-band verb-noun and adjective-noun collocations.',
    verifiedFree: true,
    fullGuide: {
      summary: 'High-frequency academic vocabulary derived from extensive linguistic research, organized into active lexical sets for Academic Reading and Writing.',
      sections: [
        {
          title: 'Sublist 1: The Core Academic Foundation',
          content: [
            'Sublist 1 represents the highest-frequency academic terms across university journals and IELTS papers.',
            'Key Headwords: analyse, approach, assess, assume, authority, available, benefit, concept, context, derive, distribute, economy, environment, establish, factor, indicate, interpret, major, principle, require, significant.',
            'Transformational Nominalisation: Higher band writing transforms simple verbal clauses into dense nominal phrases.'
          ],
          examples: [
            'Basic: "When factories pollute the river, fish die." (Band 5.0)',
            'Advanced: "The discharge of industrial contaminants into aquatic ecosystems precipitates severe ecological degradation." (Band 8.5)'
          ]
        },
        {
          title: 'Collocation Power-Sets for IELTS Writing',
          content: [
            'Evidence: compelling evidence, empirical evidence, unsubstantiated claims, conclusive proof.',
            'Problems: pressing dilemmas, exacerbate the crisis, mitigate the fallout, pose a formidable obstacle.',
            'Impact: profound ramifications, detrimental repercussions, mutually advantageous outcomes.',
            'Change: radical transformation, incremental progress, unprecedented acceleration.'
          ]
        }
      ],
      actionChecklist: [
        'Learn words in collocation families rather than isolated lists.',
        'Practice nominalisation to make your academic writing concise and formal.',
        'Use the Spaced Repetition Vocabulary Queue to review headwords on 1-day, 3-day, and 7-day intervals.'
      ]
    }
  },
  {
    id: 'res-ielts-liz',
    title: 'IELTS Liz 4-Paragraph Blueprint & Cohesive Devices',
    provider: 'IELTS Liz (Elizabeth Ferguson)',
    url: 'https://ieltsliz.com',
    skill: 'writing',
    level: 'Band 6.0–9.0',
    type: 'Pedagogical Essay Blueprint',
    authority: 'trusted_education',
    usageMode: 'licensed_content',
    readingTimeMinutes: 9,
    description: 'Proven 4-paragraph essay frameworks, thesis formulations, and sophisticated cohesive linkers taught by a veteran British Council examiner.',
    verifiedFree: true,
    fullGuide: {
      summary: 'A clean, systematic method to compose Band 8.0+ essays within 40 minutes without memorizing robotic templates or sounding unnatural.',
      sections: [
        {
          title: 'The Unbreakable 4-Paragraph Blueprint',
          content: [
            'Paragraph 1: Paraphrase the prompt (1 sentence) + Clear thesis statement with direct answer (1 sentence). Total: 2 sentences, ~45 words.',
            'Paragraph 2 (Body 1): Topic sentence (1) + Detailed explanation of mechanism (1-2) + Specific concrete illustration (1) + Result/Concluding sentence (1). Total: 4-5 sentences, ~90 words.',
            'Paragraph 3 (Body 2): Topic sentence supporting main stance (1) + Deep analytical elaboration (1-2) + Real-world evidence (1) + Consequence (1). Total: 4-5 sentences, ~95 words.',
            'Paragraph 4 (Conclusion): Restate thesis using altered vocabulary (1) + Final summarizing synthesis without new arguments (1). Total: 2 sentences, ~40 words.'
          ],
          callout: 'Total word count: 265–285 words. This is the optimal length—it ensures depth while leaving 5 minutes for careful error checks.'
        },
        {
          title: 'Advanced Cohesive Linking Words (Banning AI Clichés)',
          content: [
            'Banned Clichés: "Nowadays in this modern era", "Every coin has two sides", "It is a double-edged sword", "In a nutshell".',
            'Contrast: "Conversely,", "In marked contrast,", "While it is undeniable that...".',
            'Addition: "Furthermore,", "In addition to this,", "Moreover,".',
            'Consequence: "Consequently,", "Hence,", "As a direct repercussion,".'
          ]
        }
      ],
      actionChecklist: [
        'Spend the first 5 minutes planning ideas, main arguments, and topic sentences before typing.',
        'Never write more than 300 words—excessive length introduces grammatical slips and reduces time for proofreading.',
        'Check subject-verb agreement and singular/plural articles during the final 5 minutes.'
      ]
    }
  },
  {
    id: 'res-bbc-6min',
    title: 'BBC Listening Comprehension & Accent Deciphering',
    provider: 'BBC Learning English',
    url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
    skill: 'listening',
    level: 'Band 6.0–8.5',
    type: 'Acoustic Decoding & Signposts',
    authority: 'trusted_education',
    usageMode: 'licensed_content',
    readingTimeMinutes: 8,
    description: 'Techniques for deciphering fast connected speech, elision, weak vowel forms, and diverse international accents in IELTS Listening Parts 2-4.',
    verifiedFree: true,
    fullGuide: {
      summary: 'A master guide to acoustic features that cause candidates to mishear critical answers in Section 3 and Section 4 of IELTS Listening.',
      sections: [
        {
          title: 'Connected Speech & Phonetic Traps',
          content: [
            'Elision: The disappearance of sounds. In rapid English, /t/ and /d/ often vanish between consonants. "Next day" sounds like "nex-day"; "fast train" sounds like "fas-train".',
            'Weak Forms: Prepositions and auxiliary verbs ("to", "for", "can", "of") are pronounced with the weak schwa /ə/ sound. Candidates expecting full pronunciation often miss them.',
            'Intrusion: An extra /r/, /w/, or /j/ sound is inserted between vowels. E.g. "media attention" sounds like "media-r-attention".'
          ],
          callout: 'Distractor Patterns: The audio will often state a figure, and then immediately correct it: "We originally planned for 15 guests, but actually 18 confirmed." The answer is 18!'
        },
        {
          title: 'Signpost Language in Academic Lectures (Section 4)',
          content: [
            'Listen for structural transition phrases that signal an answer is imminent:',
            '"The crucial takeaway here is..." -> Indicates main finding.',
            '"Turning now to the methodology..." -> Indicates section shift.',
            '"What baffled scientists, however, was..." -> Signals surprising result.'
          ]
        }
      ],
      actionChecklist: [
        'Write answers on your paper/screen immediately as you hear them; do not attempt to hold more than 2 answers in short-term memory.',
        'Watch for sudden corrections ("Actually...", "Wait a moment...", "On second thought...").',
        'Pay strict attention to word count limitations stated in the instruction header.'
      ]
    }
  }
];

// ============================================================================
// 5B. VERIFIED OFFICIAL IELTS BOOKS & ARCHIVED PDF LIBRARY
// ============================================================================

export const IELTS_BOOKS: IELTSBook[] = [
  {
    id: 'book-cambridge-17',
    identifier: 'cambridge-17',
    title: 'Cambridge IELTS 17 Academic with Answers',
    author: 'Cambridge Assessment English',
    publisher: 'Cambridge University Press',
    year: 2022,
    skill: 'all',
    category: 'Full Practice Exams',
    level: 'Band 6.0–9.0',
    downloads: '567K+',
    description: 'Four authentic examination papers from Cambridge Assessment English. Includes full answer keys, audio transcripts, sample candidate essays, and examiner comments.',
    pdfFileName: 'Cambridge 17.pdf',
    quality: 'vector_hd',
  },
  {
    id: 'book-cambridge-15',
    identifier: 'cambridge-ielts-15-academic',
    title: 'Cambridge IELTS 15 Academic with Answers',
    author: 'Cambridge Assessment English',
    publisher: 'Cambridge University Press',
    year: 2020,
    skill: 'all',
    category: 'Full Practice Exams',
    level: 'Band 6.0–9.0',
    downloads: '20K+',
    description: 'Authentic examination papers from Cambridge University Press. 100% digital vector PDF with pristine clarity, answer keys, sample essays, and transcripts.',
    pdfFileName: 'Cambridge-IELTS-15-Academic.pdf',
    quality: 'vector_hd',
  },
  {
    id: 'book-cambridge-vocab',
    identifier: 'CambridgeVocabularyForIELTSWithAnswer',
    title: 'Cambridge Vocabulary for IELTS with Answers',
    author: 'Pauline Cullen',
    publisher: 'Cambridge University Press',
    year: 2008,
    skill: 'vocabulary',
    category: 'Vocabulary Mastery',
    level: 'Band 6.5+',
    downloads: '90K+',
    description: 'Covers all the vocabulary needed by students aiming for Band 6.5 and above. Includes thematic word banks, academic collocations, and test-task drills.',
    pdfFileName: 'Cambridge Vocabulary for IELTS with Answer.pdf',
    quality: 'vector_hd',
  },
  {
    id: 'book-grammar-ielts',
    identifier: 'BookGrammarForIELTS',
    title: 'Cambridge Grammar for IELTS Student\'s Book',
    author: 'Diana Hopkins & Pauline Cullen',
    publisher: 'Cambridge University Press',
    year: 2007,
    skill: 'grammar',
    category: 'Grammar Foundations',
    level: 'Band 5.5–8.5',
    downloads: '36K+',
    description: 'Provides thorough coverage of the grammar needed for IELTS with clear explanations, contextual audio tasks, and exam practice exercises.',
    pdfFileName: 'Book Grammar for IELTS.pdf',
    quality: 'vector_hd',
  },
  {
    id: 'book-lessons-speaking',
    identifier: 'lessons_for_ielts_speaking_202212',
    title: 'Lessons for IELTS Speaking with Audio Transcripts',
    author: 'New Oriental IELTS Research Institute',
    publisher: 'Beijing Language and Culture University Press',
    year: 2012,
    skill: 'speaking',
    category: 'Speaking Masterclass',
    level: 'Band 6.0–8.0',
    downloads: '48K+',
    description: 'Structured 20-unit speaking course covering all three parts of the interview with topical vocabulary, response expansions, and model answers.',
    pdfFileName: 'lessons_for_ielts_speaking.pdf',
    quality: 'standard_ocr',
  },
  {
    id: 'book-complete-ielts-565',
    identifier: 'WBCompleteIELTSBand565',
    title: 'Complete IELTS Bands 5-6.5 Workbook',
    author: 'Guy Brook-Hart & Vanessa Jakeman',
    publisher: 'Cambridge University Press',
    year: 2012,
    skill: 'all',
    category: 'Structured Coursebook',
    level: 'Band 5.0–6.5',
    downloads: '48K+',
    description: 'Official Cambridge coursebook workbook containing exercises to build reading comprehension, listening accuracy, writing cohesion, and speaking fluency.',
    pdfFileName: 'WB_Complete_IELTS_Band_5-6_5.pdf',
    quality: 'vector_hd',
  },
  {
    id: 'book-complete-ielts-45',
    identifier: 'CompleteIELTSBand45',
    title: 'Complete IELTS Bands 4-5 Student\'s Book',
    author: 'Guy Brook-Hart & Vanessa Jakeman',
    publisher: 'Cambridge University Press',
    year: 2012,
    skill: 'all',
    category: 'Foundation Coursebook',
    level: 'Band 4.0–5.5',
    downloads: '36K+',
    description: 'Designed for candidates targeting Band 4.5 to 5.5, building core test strategies, fundamental grammatical structures, and vocabulary foundations.',
    pdfFileName: 'Complete IELTS Band 4-5.pdf',
    quality: 'standard_ocr',
  },
  {
    id: 'book-ready-for-ielts',
    identifier: 'Ready-ForI-ELTS',
    title: 'Ready for IELTS Student\'s Book',
    author: 'Sam McCarter',
    publisher: 'Macmillan Education',
    year: 2018,
    skill: 'all',
    category: 'Comprehensive Coursebook',
    level: 'Band 6.0–7.5',
    downloads: '27K+',
    description: 'Comprehensive coursebook preparing students for Academic IELTS with in-depth skill training, model essays, and extensive practice files.',
    pdfFileName: 'Ready For IELTS Student Book .pdf',
    quality: 'vector_hd',
  },
];

// ============================================================================
// 6. MASTER LESSONS & EXAM ARCHITECTURE
// ============================================================================

export const IELTS_LESSONS: Lesson[] = [
  {
    id: 'les-tfng-logic',
    skill: 'reading',
    title: 'True, False, Not Given: The Logic System',
    category: 'Reading Strategy',
    estimatedMinutes: 12,
    overview: 'Learn the strict distinction between contradictory claims (False) and absent claims (Not Given) on official IELTS papers.',
    keyTakeaways: [
      'TRUE means the passage directly and unambiguously affirms the statement factually or synonymously.',
      'FALSE means the passage directly contradicts the statement with opposite facts.',
      'NOT GIVEN means the passage does not contain enough information to decide, even if the premise is true in real life.',
    ],
    content: [
      'The most frequent pitfall for Band 6.5 candidates is confusing outside general knowledge with textual proof.',
      'Never extrapolate or deduce beyond the strict linguistic bounds of the sentence span.',
      'Pay special attention to qualifying adverbs such as "all", "predominantly", "invariably", and "occasionally".',
    ],
    checkQuestions: [
      {
        id: 'cq-1',
        question: 'If the text says "Titanium coatings are sometimes applied to modern skyscrapers," and the statement says "All skyscrapers are treated with titanium coatings," what is the correct answer?',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctIndex: 1,
        rationale: 'The word "All" directly contradicts the textual boundary "sometimes", which makes it FALSE.',
      },
      {
        id: 'cq-2',
        question: 'If the text states "Solar radiation in Singapore is monitored continuously," and the prompt asserts "Singapore has the highest solar irradiation levels in Asia," what is the answer?',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctIndex: 2,
        rationale: 'While Singapore is sunny, the text makes no comparative claim regarding whether it has the highest in Asia, making it NOT GIVEN.',
      },
    ],
  },
  {
    id: 'les-writing-task2-structure',
    skill: 'writing',
    title: 'Band 8.0+ Essay Architecture: The 4-Paragraph Blueprint',
    category: 'Writing Strategy',
    estimatedMinutes: 15,
    overview: 'Master the balanced 4-paragraph discursive essay structure to score high across Task Response and Coherence & Cohesion.',
    keyTakeaways: [
      'Introduction: Paraphrase the prompt with advanced syntax and formulate a clear, non-ambiguous thesis statement.',
      'Body Paragraph 1: Present view A with a clear topic sentence, extended explanation, and concrete evidence.',
      'Body Paragraph 2: Present view B (your favored view) with nuanced counter-argumentation and corroboration.',
      'Conclusion: Synthesize the central arguments and restate your final judgment without introducing new evidence.',
    ],
    content: [
      'Examiners evaluate whether your position is clear throughout the response (Band 7+ Task Response requirement).',
      'Avoid robotic memorized formulas like "Nowadays in modern society" or "This essay will discuss both viewpoints".',
      'Use sophisticated cohesive devices: cohesive conjunctions, pronoun reference chains, and semantic lexical substitution.',
    ],
    checkQuestions: [
      {
        id: 'cq-w-1',
        question: 'Where should your personal stance first appear in a "Discuss both views and give your opinion" essay to satisfy Band 8.0 Task Response criteria?',
        options: [
          'In the introduction as part of your clear thesis statement',
          'Only at the very end in the conclusion',
          'Nowhere; the essay should remain 100% neutral',
          'In a separate fifth paragraph at the end',
        ],
        correctIndex: 0,
        rationale: 'Band 8+ descriptor specifies a clear position is presented throughout the response; stating your stance in the introduction and developing it through body paragraphs satisfies this benchmark.',
      },
    ],
  },
];

// Backwards-compatible aliases for legacy imports
export const MOCK_QUESTIONS = IELTS_QUESTIONS;
export const MOCK_VOCABULARY = IELTS_VOCABULARY;
export const MOCK_RESOURCES = IELTS_RESOURCES;
export const MOCK_LESSONS = IELTS_LESSONS;
export const MOCK_WRITING_PROMPTS = IELTS_WRITING_PROMPTS;
export const MOCK_SPEAKING_CUE_CARDS = IELTS_SPEAKING_TESTS;

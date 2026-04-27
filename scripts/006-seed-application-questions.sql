-- Seed application questions
-- SECTION 1: Basic Information
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('basic_info', 'Basic Information', 'Full name', 'short_text', '[]', true, 1),
('basic_info', 'Basic Information', 'Age', 'number', '[]', true, 2),
('basic_info', 'Basic Information', 'Gender', 'single_choice', '["Female", "Male"]', true, 3),
('basic_info', 'Basic Information', 'Nationality', 'short_text', '[]', true, 4),
('basic_info', 'Basic Information', 'Country of residence', 'short_text', '[]', true, 5),
('basic_info', 'Basic Information', 'Email', 'email', '[]', true, 6),
('basic_info', 'Basic Information', 'WhatsApp number', 'phone', '[]', true, 7),
('basic_info', 'Basic Information', 'Emergency contact name and phone number', 'short_text', '[]', true, 8),
('basic_info', 'Basic Information', 'Preferred arrival date', 'date', '[]', true, 9),
('basic_info', 'Basic Information', 'Preferred length of stay', 'single_choice', '["4–6 days", "7–13 days", "14–20 days", "21+ days", "Not sure yet"]', true, 10),
('basic_info', 'Basic Information', 'Room preference', 'single_choice', '["Shared room", "Private room", "No preference"]', true, 11),
('basic_info', 'Basic Information', 'Diet', 'single_choice', '["All", "Vegetarian", "Vegan"]', true, 12),
('basic_info', 'Basic Information', 'Do you have any food allergies or serious dietary restrictions?', 'long_text', '[]', false, 13);

-- SECTION 2: Reason for Coming
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('reason_coming', 'Reason for Coming', 'What is calling you to Paz Corcovado at this moment in your life?', 'long_text', '[]', true, 1),
('reason_coming', 'Reason for Coming', 'What are you hoping to experience or receive from your stay?', 'long_text', '[]', true, 2),
('reason_coming', 'Reason for Coming', 'Which of the following have you experienced before?', 'multiple_choice', '["Ayahuasca or plant medicine ceremony", "Vipassana or silent meditation retreat", "Surfing lessons", "Surf trip", "Solo traveling", "Backpacking or hostel travel", "Camping or wilderness travel", "Eco-village, ashram, or intentional community", "Yoga retreat or wellness retreat", "Volunteering / Workaway / farm stay", "Digital detox", "Long stay in remote nature", "None of the above", "Other"]', false, 3),
('reason_coming', 'Reason for Coming', 'What would make this stay successful for you?', 'long_text', '[]', true, 4);

-- SECTION 3: Essentials / Agreements
INSERT INTO application_questions (section_key, section_title, section_intro, question_text, question_type, options, required, order_index) VALUES
('essentials', 'Essentials / Agreements', 'Paz Corcovado is not a hotel, resort, or traditional retreat center. It is a simple resident-based living environment in remote nature. Residents share meals, respect quiet, care for their own space, follow house systems, and participate respectfully in shared life. Nature is the main teacher here.', 'Do you understand that Paz Corcovado is a shared living environment, not a hotel or resort?', 'single_choice', '["Yes, I understand", "I need more information", "No"]', true, 1),
('essentials', 'Essentials / Agreements', NULL, 'Residents are responsible for their own room, linens, towel, dishes, garbage, bathroom use, and respectful participation in shared spaces. Do you understand and accept this?', 'single_choice', '["Yes, I understand and accept", "I need more information", "No"]', true, 2),
('essentials', 'Essentials / Agreements', NULL, 'Are you comfortable cleaning after yourself without being reminded?', 'single_choice', '["Yes", "Sometimes", "No"]', true, 3),
('essentials', 'Essentials / Agreements', NULL, 'Are you comfortable participating in simple shared-life responsibilities when needed?', 'single_choice', '["Yes", "I need more information", "No"]', true, 4),
('essentials', 'Essentials / Agreements', NULL, 'Do you understand that Paz is not a place where staff serve residents in a hotel-style way?', 'single_choice', '["Yes", "No"]', true, 5),
('essentials', 'Essentials / Agreements', NULL, 'Do you understand that living here requires flexibility with weather, food systems, maintenance, tides, insects, humidity, and remote nature conditions?', 'single_choice', '["Yes", "I need more information", "No"]', true, 6),
('essentials', 'Essentials / Agreements', NULL, 'How do you usually respond when things are not organized exactly the way you expected?', 'long_text', '[]', true, 7),
('essentials', 'Essentials / Agreements', NULL, 'How do you feel about simple living conditions, insects, rain, mud, heat, humidity, wildlife sounds, and limited comfort?', 'long_text', '[]', true, 8);

-- SECTION 4: Digital Detox and Substance-Free Space
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('digital_detox', 'Digital Detox and Substance-Free Space', 'Paz has a no-phone/no-electronics culture in shared public spaces. Phones and laptops are kept for private use or designated work areas only. Are you willing to respect this?', 'single_choice', '["Yes", "I need more information", "No"]', true, 1),
('digital_detox', 'Digital Detox and Substance-Free Space', 'What is your current relationship with your phone, work, social media, or digital stimulation?', 'long_text', '[]', true, 2),
('digital_detox', 'Digital Detox and Substance-Free Space', 'Paz is a substance-free shared environment. No alcohol or recreational drugs are allowed in the shared life of the space. Are you willing to respect this fully?', 'single_choice', '["Yes", "No"]', true, 3),
('digital_detox', 'Digital Detox and Substance-Free Space', 'Are you currently dependent on alcohol, recreational drugs, or any substance that may make this environment difficult for you?', 'single_choice', '["No", "Yes", "Prefer to explain privately"]', true, 4),
('digital_detox', 'Digital Detox and Substance-Free Space', 'Do you smoke?', 'single_choice', '["No", "Occasionally", "Yes"]', true, 5),
('digital_detox', 'Digital Detox and Substance-Free Space', 'If yes, are you willing to follow smoking rules strictly and only smoke in designated areas?', 'single_choice', '["Yes", "No", "Not applicable"]', true, 6);

-- SECTION 5: Emotional and Social Maturity
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('emotional_maturity', 'Emotional and Social Maturity', 'Paz can be quiet, intense, and emotionally revealing because there are fewer distractions. How do you usually care for yourself when difficult emotions arise?', 'long_text', '[]', true, 1),
('emotional_maturity', 'Emotional and Social Maturity', 'Are you currently going through an acute emotional crisis, severe burnout, grief, breakup, or major life transition?', 'single_choice', '["No", "Yes, mildly", "Yes, strongly", "Prefer to explain privately"]', true, 2),
('emotional_maturity', 'Emotional and Social Maturity', 'Are you currently receiving mental health support or therapy?', 'single_choice', '["Yes", "No", "Prefer not to say"]', false, 3),
('emotional_maturity', 'Emotional and Social Maturity', 'Do you understand that Paz is not a medical, psychiatric, addiction recovery, or therapeutic treatment center?', 'single_choice', '["Yes", "No"]', true, 4),
('emotional_maturity', 'Emotional and Social Maturity', 'What should others know about living with you?', 'long_text', '[]', false, 5);

-- SECTION 6: Community Life and Contribution
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('community_life', 'Community Life and Contribution', 'What does being a good resident in a shared place mean to you?', 'long_text', '[]', true, 1),
('community_life', 'Community Life and Contribution', 'Are you willing to clean up after yourself immediately in the kitchen, bathrooms, rooms, and shared areas?', 'single_choice', '["Yes", "No"]', true, 2),
('community_life', 'Community Life and Contribution', 'Are you comfortable changing your own linens, managing your own room garbage, and following house systems without being reminded?', 'single_choice', '["Yes", "No"]', true, 3),
('community_life', 'Community Life and Contribution', 'Which areas of community life do you naturally enjoy contributing to?', 'multiple_choice', '["Cooking", "Cleaning", "Gardening", "Music", "Repairs", "Fire", "Organizing", "Emotional support", "Quiet presence", "Other"]', false, 4),
('community_life', 'Community Life and Contribution', 'Do you have any skills you would enjoy sharing during your stay?', 'long_text', '[]', false, 5),
('community_life', 'Community Life and Contribution', 'Do you understand that participation does not mean becoming staff, and staying here does not mean being served by staff?', 'single_choice', '["Yes", "No"]', true, 6);

-- SECTION 7: Nature, Risk, and Personal Responsibility
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('nature_risk', 'Nature, Risk, and Personal Responsibility', 'Do you understand that Paz is located in remote rainforest by the ocean, where natural risks include insects, wildlife, falling branches, strong rain, flooding, earthquakes, ocean currents, surf conditions, slippery trails, heat, and limited immediate medical access?', 'single_choice', '["Yes", "No"]', true, 1),
('nature_risk', 'Nature, Risk, and Personal Responsibility', 'Do you have valid health or travel insurance that covers your stay in Costa Rica?', 'single_choice', '["Yes", "No", "I will get it before arrival"]', true, 2),
('nature_risk', 'Nature, Risk, and Personal Responsibility', 'Do you understand that you are responsible for your own medical expenses, transportation, and decisions to enter the ocean, hike, use the sauna, or participate in activities?', 'single_choice', '["Yes", "No"]', true, 3),
('nature_risk', 'Nature, Risk, and Personal Responsibility', 'Can you swim confidently in the ocean?', 'single_choice', '["Yes", "No", "Somewhat"]', true, 4),
('nature_risk', 'Nature, Risk, and Personal Responsibility', 'Do you plan to surf?', 'single_choice', '["Yes", "No", "Maybe"]', true, 5),
('nature_risk', 'Nature, Risk, and Personal Responsibility', 'Do you have any medical condition, injury, allergy, medication, or physical limitation we should know about for safety reasons?', 'long_text', '[]', false, 6);

-- SECTION 8: Surf, Sauna, and Activities
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('activities', 'Surf, Sauna, and Activities', 'Which activities interest you?', 'multiple_choice', '["Surfing", "Beach walks", "Waterfalls", "Earth sauna", "Cold plunge", "Bonfires", "Music", "Meditation", "Journaling", "Rest", "Community meals", "Other"]', false, 1),
('activities', 'Surf, Sauna, and Activities', 'Do you understand that activities are not guaranteed daily services, and depend on weather, tides, safety, group rhythm, and availability?', 'single_choice', '["Yes", "No"]', true, 2),
('activities', 'Surf, Sauna, and Activities', 'Do you understand that Paz Earth Sauna is guided only and cannot be used freely without permission?', 'single_choice', '["Yes", "No"]', true, 3),
('activities', 'Surf, Sauna, and Activities', 'If renting surfboards, do you agree to pay in advance, use the ocean responsibly, and cover damage or loss?', 'single_choice', '["Yes", "No", "Not applicable"]', true, 4);

-- SECTION 9: Work, WiFi, and Availability
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('work_wifi', 'Work, WiFi, and Availability', 'Will you need to work online during your stay?', 'single_choice', '["No", "A little", "Part-time", "Full-time"]', true, 1),
('work_wifi', 'Work, WiFi, and Availability', 'How many hours per day do you expect to be online?', 'single_choice', '["0", "1–2", "3–4", "5+"]', true, 2),
('work_wifi', 'Work, WiFi, and Availability', 'Do you understand that Paz is not designed as a full-service coworking space and that internet/power may be limited by remote conditions?', 'single_choice', '["Yes", "No"]', true, 3),
('work_wifi', 'Work, WiFi, and Availability', 'Can you keep work calls and laptop use away from shared quiet spaces?', 'single_choice', '["Yes", "No"]', true, 4);

-- SECTION 10: Expectations Check
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('expectations', 'Expectations Check', 'Which statement feels most true for you?', 'single_choice', '["I want a comfortable retreat where things are organized for me.", "I want a surf trip with cheap food and lodging.", "I want a simple shared-life experience in nature, with basic structure and personal responsibility.", "I am not sure yet."]', true, 1),
('expectations', 'Expectations Check', 'What are you not willing to compromise on during your stay?', 'long_text', '[]', true, 2),
('expectations', 'Expectations Check', 'What would make Paz the wrong place for you?', 'long_text', '[]', true, 3),
('expectations', 'Expectations Check', 'After reading the description, do you feel this place is truly for you? Why?', 'long_text', '[]', true, 4);

-- SECTION 11: Final Note
INSERT INTO application_questions (section_key, section_title, question_text, question_type, options, required, order_index) VALUES
('final_note', 'Final Note', 'Is there anything else you would like us to know before reviewing your application?', 'long_text', '[]', false, 1);

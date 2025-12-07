// Game Data Structure and Logic

class RecruiterGame {
    constructor() {
        this.gameState = {
            timeRemaining: 30, // 30 seconds
            isPlaying: false,
            isPaused: false,
            gameOver: false,
            startTime: null,
            endTime: null,
            correctGuesses: 0,
            incorrectGuesses: 0,
            realRecruiterId: null,
            foundRealRecruiter: false
        };
        
        this.conversations = [];
        this.activeConversationId = null;
        this.filteredConversations = [];
        this.currentFilter = 'Focused';
        this.searchQuery = '';
        this.realRecruiterAdded = false;
        
        // Realistic names pool
        this.firstNames = [
            'Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James', 'Amanda', 'Robert',
            'Jennifer', 'Christopher', 'Michelle', 'Daniel', 'Ashley', 'Matthew', 'Melissa',
            'Andrew', 'Nicole', 'Joshua', 'Stephanie', 'Ryan', 'Lauren', 'Justin', 'Rachel',
            'Brandon', 'Megan', 'Tyler', 'Brittany', 'Kevin', 'Samantha', 'Eric', 'Amber',
            'Jacob', 'Danielle', 'Nathan', 'Courtney', 'Jordan', 'Rebecca', 'Zachary', 'Heather'
        ];
        
        this.lastNames = [
            'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
            'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore',
            'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
            'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright',
            'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson'
        ];
        
        // Real company names
        this.companies = [
            'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Salesforce',
            'Adobe', 'Oracle', 'IBM', 'Intel', 'Cisco', 'Nvidia', 'Uber', 'Airbnb',
            'Stripe', 'Palantir', 'Databricks', 'Snowflake', 'Atlassian', 'Slack', 'Zoom',
            'Shopify', 'Square', 'Coinbase', 'Robinhood', 'Plaid', 'Notion', 'Figma'
        ];
        
        this.consultingFirms = [
            'McKinsey & Company', 'Boston Consulting Group', 'Bain & Company', 'Deloitte',
            'PwC', 'EY', 'Accenture', 'KPMG', 'Oliver Wyman', 'Roland Berger'
        ];
        
        this.universities = [
            'Harvard Business School', 'Stanford GSB', 'Wharton', 'MIT Sloan', 'Kellogg',
            'Booth', 'Columbia Business School', 'Yale SOM', 'Tuck', 'Stern'
        ];
        
        this.fields = [
            'software engineering', 'product management', 'data science', 'UX design',
            'marketing', 'sales', 'operations', 'finance', 'consulting', 'business development'
        ];
        
        this.init();
    }
    
    init() {
        this.generateConversations();
        // Real recruiter will be set when it's added later
        // this.setRealRecruiter(); // Not needed initially
    }
    
    generateConversations() {
        const totalConversations = 3; // Start with 3 conversations (no real recruiter initially)
        // Start with 3 conversations that are NOT the real recruiter
        const conversationTypes = [
            { type: 'fake_recruiter', count: 1 },
            { type: 'coworker', count: 1 },
            { type: 'student_referral', count: 1 }
        ];
        
        this.conversations = [];
        let typeIndex = 0;
        let typeCount = 0;
        
        for (let i = 0; i < totalConversations; i++) {
            // Get next conversation type
            while (typeCount >= conversationTypes[typeIndex].count && typeIndex < conversationTypes.length - 1) {
                typeIndex++;
                typeCount = 0;
            }
            
            const type = conversationTypes[typeIndex].type;
            typeCount++;
            
            const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
            const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
            const name = `${firstName} ${lastName}`;
            
            const conversation = this.createConversation(i, name, type);
            this.conversations.push(conversation);
        }
        
        // Shuffle conversations
        this.conversations = this.shuffleArray(this.conversations);
        
        // Set first conversation as active and read
        if (this.conversations.length > 0) {
            this.conversations[0].isRead = true;
            this.activeConversationId = this.conversations[0].id;
        }
        
        // Real recruiter will be added later via new messages
        this.realRecruiterAdded = false;
    }
    
    createConversation(id, name, type) {
        const isReal = type === 'real_recruiter';
        const isInMail = type.startsWith('inmail_');
        
        // Determine filter category
        let filterCategory = 'Connections';
        if (isInMail) filterCategory = 'InMail';
        else if (type === 'real_recruiter' || type === 'fake_recruiter') filterCategory = 'Jobs';
        
        // Randomly assign online status (30% chance)
        const isOnline = Math.random() < 0.3;
        
        const conversation = {
            id: id,
            name: name,
            type: type,
            isReal: isReal,
            isFake: !isReal,
            filterCategory: filterCategory,
            isRead: false,
            isStamped: false,
            stampType: null, // 'fake' or 'real'
            messages: [],
            messageCount: 0,
            isTyping: false,
            hasEnded: false,
            endedAt: null,
            avatarColor: this.getRandomAvatarColor(),
            isOnline: isOnline
        };
        
        // Generate initial message
        const initialMessage = this.generateInitialMessage(type, name);
        conversation.messages.push(initialMessage);
        conversation.messageCount = 1;
        
        return conversation;
    }
    
    generateInitialMessage(type, name) {
        const company = this.companies[Math.floor(Math.random() * this.companies.length)];
        const field = this.fields[Math.floor(Math.random() * this.fields.length)];
        const consultingFirm = this.consultingFirms[Math.floor(Math.random() * this.consultingFirms.length)];
        const university = this.universities[Math.floor(Math.random() * this.universities.length)];
        
        const templates = {
            real_recruiter: [
                `Hi! I came across your profile and was impressed by your experience in ${field}. We have an opening at ${company} that might be a great fit. Would you be open to a quick chat?`,
                `Hello! I noticed your background in ${field} and thought you might be interested in a role we're hiring for at ${company}. Are you currently exploring new opportunities?`,
                `Hi there! Your experience caught my attention. We're looking for someone with your skill set at ${company}. Would you have time for a brief conversation this week?`,
                `Hi! I'm reaching out from ${company}. We have a ${field} position that aligns well with your background. Would you be interested in learning more?`,
                `Hello! I came across your profile and think you'd be a great fit for a role at ${company}. Are you open to a brief conversation about the opportunity?`
            ],
            fake_recruiter: [
                `Hi! I saw your profile and think you'd be perfect for a role we're hiring for. Are you interested?`,
                `Hello! We have an opening that matches your background. Would you like to learn more?`,
                `Hi there! I came across your profile and wanted to reach out about a potential opportunity.`,
                `Hello! Are you currently looking for new opportunities? We might have something that interests you.`,
                `Hi! I noticed your experience and thought you might be interested in a position we're filling.`
            ],
            coworker: [
                `Hey! Hope you're doing well. Just wanted to catch up and see how things are going.`,
                `Hi! Long time no talk. How have you been? Would love to grab coffee sometime.`,
                `Hey there! I saw your recent post about [topic]. That's really interesting! How's everything?`
            ],
            boss: [
                `Hi, I wanted to follow up on our conversation from last week. Do you have a moment to discuss?`,
                `Hello, I hope you're doing well. I'd like to schedule a quick check-in when you have time.`,
                `Hi, just wanted to touch base. Let me know when you're available for a brief call.`
            ],
            inmail_consulting: [
                `Hi! I'm reaching out from ${consultingFirm}. We specialize in helping businesses like yours achieve growth and operational excellence. Would you be interested in a free consultation?`,
                `Hello! Are you looking to grow your business? ${consultingFirm} has helped 1000+ companies increase revenue. Would you like to learn more about our services?`,
                `Hi there! We offer premium consulting services at ${consultingFirm}. I'd love to discuss how we can help your business. Are you available for a brief call?`
            ],
            inmail_webdesign: [
                `Hi! I'm a web designer looking for new projects. I can create a stunning website for your business starting at just $99! Interested?`,
                `Hello! Need a professional website? I've designed 500+ websites and can create yours in 24 hours! Get a free quote today!`,
                `Hi there! Your business deserves a beautiful website! I offer custom web design services. Would you like to see my portfolio?`
            ],
            inmail_mba: [
                `Hi! Are you considering an MBA? ${university} offers a top-ranked program with flexible scheduling. Would you like to learn more about our program?`,
                `Hello! Advance your career with an MBA from ${university}. Our graduates see an average salary increase of 85%! Would you be interested in more information?`,
                `Hi there! Thinking about business school? ${university} MBA program is now accepting applications. I'd be happy to discuss the program with you.`
            ],
            student_referral: [
                `Hi! I'm a recent graduate from ${university} and I noticed you work at ${company}. I'm really interested in opportunities there and was wondering if you'd be open to a quick chat about your experience?`,
                `Hello! I'm currently a student at ${university} studying ${field}. I saw your profile and was hoping you might have time to discuss your career path. Would you be open to connecting?`,
                `Hi there! I'm graduating soon and I'm very interested in ${company}. I noticed you work there and was wondering if you'd be willing to share some insights about the company culture?`,
                `Hello! I'm a student looking to break into ${field}. I saw your background and was hoping you might have a few minutes to chat about how you got started in your career?`
            ],
            unemployed_person: [
                `Hi! I hope you're doing well. I'm currently between opportunities and was wondering if you know of any openings in ${field}? I'd really appreciate any leads you might have.`,
                `Hello! I know it's been a while, but I'm currently looking for work and thought you might have some connections or advice. Would you be open to a quick conversation?`,
                `Hi there! I'm reaching out because I'm actively job searching in ${field} and thought you might have some insights or know of any opportunities. Any help would be greatly appreciated.`,
                `Hello! I'm currently looking for new opportunities and was hoping you might be able to point me in the right direction. Do you have any advice for someone in my position?`
            ],
            casual_hi: [
                `Hi!`,
                `Hey!`,
                `Hello!`,
                `Hi there!`,
                `Hey, how's it going?`
            ],
            how_are_you: [
                `Hey! How are you doing?`,
                `Hi! How have you been?`,
                `Hello! How's everything going?`,
                `Hey there! How are things?`,
                `Hi! Long time no talk. How are you?`
            ]
        };
        
        const messagePool = templates[type] || templates.fake_recruiter;
        const message = messagePool[Math.floor(Math.random() * messagePool.length)];
        
        return {
            id: 0,
            sender: name,
            text: message,
            timestamp: new Date(),
            isUser: false
        };
    }
    
    generateResponseOptions(conversation) {
        const isNewConversation = conversation.messages.length === 1;
        const context = this.getConversationContext(conversation);
        
        if (isNewConversation) {
            // Generic opening responses
            return this.getGenericResponses();
        } else {
            // Context-specific responses
            return this.getContextResponses(conversation.type, context);
        }
    }
    
    getGenericResponses() {
        const pools = [
            ['Thanks for reaching out!', 'I appreciate the message.', 'That sounds interesting.'],
            ['I\'d love to learn more.', 'Can you tell me more?', 'That could work.'],
            ['Thanks!', 'Sounds good.', 'I\'ll think about it.']
        ];
        
        const selected = pools[Math.floor(Math.random() * pools.length)];
        const emojiPool = ['👍', '🙂', '👋', '💼', '✨', '🎯'];
        const hasEmoji = Math.random() > 0.5;
        
        if (hasEmoji) {
            const randomEmoji = emojiPool[Math.floor(Math.random() * emojiPool.length)];
            const randomIndex = Math.floor(Math.random() * selected.length);
            selected[randomIndex] = selected[randomIndex] + ' ' + randomEmoji;
        }
        
        return selected;
    }
    
    getContextResponses(type, context) {
        const responses = {
            real_recruiter: [
                ['I\'d be interested in learning more.', 'That sounds like a great opportunity.', 'Can you share more details?'],
                ['I\'m open to exploring this.', 'What does the role entail?', 'I\'d love to discuss this further.'],
                ['Thanks for reaching out!', 'I\'m definitely interested.', 'When would be a good time to chat?']
            ],
            fake_recruiter: [
                ['Can you provide more information?', 'What company is this for?', 'I\'d like to know more.'],
                ['This sounds interesting.', 'What are the requirements?', 'Tell me more about the role.'],
                ['Thanks!', 'I\'m curious to learn more.', 'Can you send details?']
            ],
            coworker: [
                ['Hey! Good to hear from you.', 'I\'ve been doing well, thanks!', 'Would love to catch up!'],
                ['Things are going great!', 'How about you?', 'Coffee sounds good!'],
                ['Thanks for reaching out!', 'I\'m doing well.', 'Let\'s plan something soon.']
            ],
            boss: [
                ['Of course, I have time.', 'I\'m available to discuss.', 'When works for you?'],
                ['I can make time for that.', 'Let me know when you\'re free.', 'I\'m happy to chat.'],
                ['Sure thing!', 'I\'m available.', 'What would you like to discuss?']
            ],
            inmail_consulting: [
                ['I might be interested.', 'Can you send more information?', 'What services do you offer?'],
                ['Thanks for reaching out.', 'I\'ll consider it.', 'Tell me more about your services.'],
                ['Interesting offer.', 'What are your rates?', 'I\'d like to learn more.']
            ],
            inmail_webdesign: [
                ['I might need a website.', 'Can you share your portfolio?', 'What are your rates?'],
                ['That sounds interesting.', 'I\'d like to see examples.', 'Tell me more about your process.'],
                ['Thanks for the offer.', 'I\'ll keep you in mind.', 'Can you send more details?']
            ],
            inmail_mba: [
                ['I\'m considering an MBA.', 'Can you send program details?', 'What are the requirements?'],
                ['That sounds interesting.', 'I\'d like to learn more.', 'What\'s the application process?'],
                ['Thanks for reaching out.', 'I\'ll look into it.', 'Can you provide more information?']
            ],
            student_referral: [
                ['I\'d be happy to help!', 'Sure, I can share my experience.', 'I\'d be open to chatting.'],
                ['Of course!', 'I\'d be glad to connect.', 'Happy to help out.'],
                ['I\'d be happy to chat.', 'Sure thing!', 'I can make some time for that.']
            ],
            unemployed_person: [
                ['I\'ll keep an eye out for opportunities.', 'I\'d be happy to help if I hear of anything.', 'I\'ll let you know if I come across anything.'],
                ['I understand how tough it can be.', 'I\'ll keep you in mind.', 'I\'ll reach out if I hear of anything relevant.'],
                ['I\'ll keep an eye out.', 'Happy to help if I can.', 'I\'ll let you know if something comes up.']
            ],
            casual_hi: [
                ['Hi!', 'Hey!', 'Hello!'],
                ['Hi there!', 'Hey, how are you?', 'Hello!'],
                ['Hi!', 'Hey!', 'What\'s up?']
            ],
            how_are_you: [
                ['I\'m doing well, thanks!', 'Pretty good, thanks for asking!', 'Doing great, how about you?'],
                ['I\'m good, thanks!', 'All good here!', 'Doing well, thanks!'],
                ['I\'m doing well!', 'Pretty good!', 'All good, thanks!']
            ]
        };
        
        const pool = responses[type] || responses.fake_recruiter;
        const selected = pool[Math.floor(Math.random() * pool.length)];
        
        // Randomly add emoji
        if (Math.random() > 0.6) {
            const emojiPool = ['👍', '🙂', '💼', '✨', '🎯', '📚'];
            const randomEmoji = emojiPool[Math.floor(Math.random() * emojiPool.length)];
            const randomIndex = Math.floor(Math.random() * selected.length);
            selected[randomIndex] = selected[randomIndex] + ' ' + randomEmoji;
        }
        
        return selected;
    }
    
    getConversationContext(conversation) {
        // Analyze recent messages to determine context
        const recentMessages = conversation.messages.slice(-3);
        const lastUserMessage = recentMessages.filter(m => m.isUser).pop();
        const lastNPCMessage = recentMessages.filter(m => !m.isUser).pop();
        
        // Extract context from messages
        const context = {
            userMessage: lastUserMessage ? lastUserMessage.text.toLowerCase() : '',
            npcMessage: lastNPCMessage ? lastNPCMessage.text.toLowerCase() : '',
            conversationType: conversation.type,
            messageCount: conversation.messages.length
        };
        
        return context;
    }
    
    generateNPCResponse(conversation, userMessage) {
        const type = conversation.type;
        const isReal = conversation.isReal;
        const context = this.getConversationContext(conversation);
        
        // Real recruiters give thoughtful, personalized responses
        if (isReal) {
            return this.generateRealRecruiterResponse(conversation, context);
        }
        
        // Fake recruiters and bots give generic/template responses
        return this.generateFakeResponse(type, conversation, context);
    }
    
    generateRealRecruiterResponse(conversation, context) {
        const userMsg = context.userMessage;
        const company = this.companies[Math.floor(Math.random() * this.companies.length)];
        
        // Contextual responses based on what user said
        if (userMsg.includes('interested') || userMsg.includes('learn more') || userMsg.includes('details')) {
            return `Great! I'd love to set up a time to chat. Are you available this week for a 15-minute call? I can share more about the role and answer any questions you have.`;
        }
        if (userMsg.includes('available') || userMsg.includes('time') || userMsg.includes('when')) {
            return `Perfect! How does Thursday afternoon work for you? I can send a calendar invite. The role is at ${company} and I think it could be a great fit based on your background.`;
        }
        if (userMsg.includes('tell me') || userMsg.includes('what') || userMsg.includes('role')) {
            return `The position is for a Senior Developer role at ${company}. We're looking for someone with 5+ years of experience in full-stack development. The team is growing and there are great opportunities for advancement. Does that sound interesting?`;
        }
        if (userMsg.includes('thanks') || userMsg.includes('appreciate')) {
            return `You're welcome! I'll send over a job description shortly. What's the best email to reach you? I'd love to schedule a quick call to discuss if this could be a good fit.`;
        }
        
        // Default contextual responses
        const responses = [
            `Great! I'd love to set up a time to chat. Are you available this week for a 15-minute call?`,
            `Perfect! The role is at ${company} and I think it could be a great match. When would be a good time for a brief conversation?`,
            `Thanks for your interest! I'll send over a job description and we can discuss if it's a good fit. What's the best email to reach you?`,
            `I appreciate you getting back to me! The position involves leading a small team and working on innovative projects at ${company}. Would you like to learn more?`,
            `That's great to hear! We're looking to expand our engineering team at ${company}. Are you free for a quick call this week?`,
            `Excellent! I think this could be a great match. The role offers competitive compensation and great growth opportunities. Can we schedule a 20-minute conversation?`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    generateFakeResponse(type, conversation, context) {
        const userMsg = context.userMessage || '';
        
        // Helper function to get contextual responses
        const getCoworkerResponses = () => {
            if (userMsg.includes('coffee') || userMsg.includes('catch up') || userMsg.includes('meet')) {
                return [
                    `That sounds great! How about next week?`,
                    `Perfect! I'll check my schedule and let you know.`,
                    `I'd love to! Let me see when I'm free.`
                ];
            }
            if (userMsg.includes('well') || userMsg.includes('good') || userMsg.includes('great')) {
                return [
                    `That's awesome to hear!`,
                    `So glad things are going well for you!`,
                    `That's great! Happy for you.`
                ];
            }
            return [
                `That's great to hear! Let me know when works for you.`,
                `Sounds good! I'll reach out soon to set something up.`,
                `Perfect! Looking forward to catching up.`
            ];
        };
        
        const getBossResponses = () => {
            if (userMsg.includes('available') || userMsg.includes('time') || userMsg.includes('when')) {
                return [
                    `Thanks for getting back to me. I'll send a calendar invite.`,
                    `Great! I'll follow up with a meeting invite.`,
                    `Perfect timing. I'll schedule something this week.`
                ];
            }
            return [
                `Thanks for getting back to me. I'll send a calendar invite.`,
                `Great! I'll follow up with details.`,
                `Perfect timing. Let's schedule something this week.`
            ];
        };
        
        const getStudentReferralResponses = () => {
            if (userMsg.includes('help') || userMsg.includes('chat') || userMsg.includes('connect')) {
                return [
                    `That would be amazing! Thank you so much for being willing to help.`,
                    `I really appreciate your time! This means a lot to me.`,
                    `Thank you so much! I'll send you my resume and a bit about my background.`
                ];
            }
            return [
                `Thanks so much! I really appreciate it.`,
                `That would be amazing! Thank you for being willing to help.`,
                `I really appreciate your time! This means a lot.`
            ];
        };
        
        const getUnemployedResponses = () => {
            if (userMsg.includes('help') || userMsg.includes('opportunities') || userMsg.includes('leads')) {
                return [
                    `Thank you so much! I really appreciate any help you can provide.`,
                    `That means a lot, thank you! I'll keep you updated on my search.`,
                    `I really appreciate it! Thank you for keeping me in mind.`
                ];
            }
            return [
                `Thank you so much! I really appreciate any help you can provide.`,
                `That means a lot, thank you!`,
                `I really appreciate it! Thank you for keeping me in mind.`
            ];
        };
        
        const templates = {
            fake_recruiter: [
                `Great! I'll send you more details right away.`,
                `Perfect! Let me get you connected with our hiring team.`,
                `Excellent! I'll forward your information to the team.`,
                `Wonderful! I'll send you the job description shortly.`,
                `Thanks for your interest! I'll follow up with more information.`
            ],
            coworker: getCoworkerResponses(),
            boss: getBossResponses(),
            student_referral: getStudentReferralResponses(),
            unemployed_person: getUnemployedResponses(),
            casual_hi: [
                `Hi! How are you?`,
                `Hey! What's up?`,
                `Hello! How's it going?`,
                `Hi there! How have you been?`,
                `Hey! Long time no see!`
            ],
            how_are_you: [
                `I'm doing well, thanks for asking! How about you?`,
                `Pretty good! Thanks for checking in.`,
                `All good here! How are things with you?`,
                `Doing great! Thanks for asking.`,
                `I'm well, thank you! How have you been?`
            ],
            inmail_consulting: [
                `Excellent! I'll send you our information packet right away.`,
                `Great! Our team will contact you within 24 hours.`,
                `Perfect! I'll have someone reach out to schedule a consultation.`
            ],
            inmail_webdesign: [
                `Wonderful! I'll send you my portfolio and pricing right away.`,
                `Great! I can start your project soon. Let me send you some examples.`,
                `Perfect! I'll send you a quote and some samples of my work.`
            ],
            inmail_mba: [
                `Excellent! I'll send you program information and application details.`,
                `Great! Our admissions team will contact you soon.`,
                `Perfect! I'll send you our program guide and next steps.`
            ]
        };
        
        const pool = templates[type] || templates.fake_recruiter;
        return pool[Math.floor(Math.random() * pool.length)];
    }
    
    setRealRecruiter() {
        const recruiterConversations = this.conversations.filter(c => c.type === 'real_recruiter');
        if (recruiterConversations.length > 0) {
            this.gameState.realRecruiterId = recruiterConversations[0].id;
        }
    }
    
    stampConversation(conversationId, stampType) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation && !conversation.isStamped) {
            conversation.isStamped = true;
            conversation.stampType = stampType;
            
            // Check if correct
            const isCorrect = (stampType === 'real' && conversation.isReal) || 
                            (stampType === 'fake' && !conversation.isReal);
            
            if (isCorrect) {
                this.gameState.correctGuesses++;
                this.gameState.timeRemaining += 15;
                
                // If they found the real recruiter
                if (stampType === 'real' && conversation.isReal) {
                    this.gameState.foundRealRecruiter = true;
                    this.endGame(true);
                }
            } else {
                this.gameState.incorrectGuesses++;
                this.gameState.timeRemaining = Math.max(0, this.gameState.timeRemaining - 10);
            }
            
            return isCorrect;
        }
        return null;
    }
    
    checkRealRecruiter(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
            if (conversation.isReal) {
                // Correct! Found the real recruiter
                this.gameState.foundRealRecruiter = true;
                this.gameState.correctGuesses++;
                this.endGame(true);
                return true;
            } else {
                // Wrong! This is not the real recruiter
                this.gameState.incorrectGuesses++;
                this.gameState.timeRemaining = Math.max(0, this.gameState.timeRemaining - 10);
                return false;
            }
        }
        return null;
    }
    
    sendMessage(conversationId, messageText) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation || conversation.hasEnded) return;
        
        // Add user message
        const userMessage = {
            id: conversation.messageCount++,
            sender: 'You',
            text: messageText,
            timestamp: new Date(),
            isUser: true
        };
        conversation.messages.push(userMessage);
        
        // Mark as read
        conversation.isRead = true;
        
        // Generate NPC response after delay
        conversation.isTyping = true;
        
        setTimeout(() => {
            conversation.isTyping = false;
            const npcResponse = this.generateNPCResponse(conversation, messageText);
            const responseMessage = {
                id: conversation.messageCount++,
                sender: conversation.name,
                text: npcResponse,
                timestamp: new Date(),
                isUser: false
            };
            conversation.messages.push(responseMessage);
            
            // Randomly end conversation (8-20% chance after each response)
            if (Math.random() < 0.12) {
                conversation.hasEnded = true;
                conversation.endedAt = new Date();
            }
            
            // Trigger UI update
            if (window.updateGameUI) {
                window.updateGameUI();
            }
        }, 1500 + Math.random() * 1000); // 1.5-2.5 second delay
    }
    
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.gameOver = false;
        this.gameState.startTime = Date.now();
        this.gameState.timeRemaining = 30;
        this.gameState.correctGuesses = 0;
        this.gameState.incorrectGuesses = 0;
        this.gameState.foundRealRecruiter = false;
        
        this.init();
        this.startTimer();
        this.scheduleNewMessages();
    }
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (this.gameState.isPlaying && !this.gameState.isPaused) {
                this.gameState.timeRemaining--;
                
                if (this.gameState.timeRemaining <= 0) {
                    this.gameState.timeRemaining = 0;
                    this.endGame(false);
                }
                
                if (window.updateTimer) {
                    window.updateTimer();
                }
            }
        }, 1000);
    }
    
    scheduleNewMessages() {
        // Schedule new messages more frequently
        const numNewMessages = 4 + Math.floor(Math.random() * 3); // 4-6 new messages
        const totalTime = 30; // seconds
        
        // Real recruiter should appear later (after at least 2-3 other messages)
        const realRecruiterDelayIndex = 2 + Math.floor(Math.random() * 2); // Appears as 3rd or 4th new message
        
        for (let i = 0; i < numNewMessages; i++) {
            // Spread messages more evenly throughout the game
            const baseDelay = (totalTime / (numNewMessages + 1)) * (i + 1);
            const randomOffset = (Math.random() * 4) - 2; // -2 to +2 seconds for more frequent appearance
            const delay = Math.max(2, baseDelay + randomOffset); // At least 2 seconds
            const delayMs = delay * 1000;
            
            setTimeout(() => {
                if (this.gameState.isPlaying && !this.gameState.gameOver) {
                    // Add real recruiter at the specified delay index
                    if (i === realRecruiterDelayIndex && !this.realRecruiterAdded) {
                        this.addRealRecruiter();
                    } else {
                        this.addNewConversation();
                    }
                }
            }, delayMs);
        }
    }
    
    addNewConversation() {
        // Find a conversation that hasn't been created yet or create a new one
        // Never add a real recruiter as a new message - only fake ones
        const types = [
            'fake_recruiter', 'coworker', 'boss', 
            'student_referral', 'unemployed_person', 'casual_hi', 'how_are_you',
            'inmail_consulting', 'inmail_webdesign', 'inmail_mba'
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        const name = `${firstName} ${lastName}`;
        
        const newId = this.conversations.length;
        const conversation = this.createConversation(newId, name, type);
        this.conversations.push(conversation);
        
        // Show typing indicator briefly
        conversation.isTyping = true;
        setTimeout(() => {
            conversation.isTyping = false;
            if (window.addNewMessageWithAnimation) {
                window.addNewMessageWithAnimation(conversation.id);
            }
            if (window.updateGameUI) {
                window.updateGameUI();
            }
        }, 2000);
        
        if (window.updateGameUI) {
            window.updateGameUI();
        }
    }
    
    addRealRecruiter() {
        // Add the real recruiter as a new message (appears later in the game)
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        const name = `${firstName} ${lastName}`;
        
        const newId = this.conversations.length;
        const conversation = this.createConversation(newId, name, 'real_recruiter');
        this.conversations.push(conversation);
        this.realRecruiterAdded = true;
        this.gameState.realRecruiterId = conversation.id;
        
        // Show typing indicator briefly
        conversation.isTyping = true;
        setTimeout(() => {
            conversation.isTyping = false;
            if (window.addNewMessageWithAnimation) {
                window.addNewMessageWithAnimation(conversation.id);
            }
            if (window.updateGameUI) {
                window.updateGameUI();
            }
        }, 2000);
        
        if (window.updateGameUI) {
            window.updateGameUI();
        }
    }
    
    endGame(won) {
        this.gameState.isPlaying = false;
        this.gameState.gameOver = true;
        this.gameState.endTime = Date.now();
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (window.showResultsScreen) {
            window.showResultsScreen(won);
        }
    }
    
    resetGame() {
        this.gameState.isPlaying = false;
        this.gameState.gameOver = false;
        this.gameState.timeRemaining = 30;
        this.gameState.correctGuesses = 0;
        this.gameState.incorrectGuesses = 0;
        this.gameState.foundRealRecruiter = false;
        this.realRecruiterAdded = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.init();
        
        if (window.resetGameUI) {
            window.resetGameUI();
        }
    }
    
    filterConversations(filter) {
        this.currentFilter = filter;
        this.applyFilters();
    }
    
    searchConversations(query) {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }
    
    applyFilters() {
        let filtered = [...this.conversations];
        
        // Apply filter
        if (this.currentFilter === 'Unread') {
            filtered = filtered.filter(c => !c.isRead);
        } else if (this.currentFilter === 'InMail') {
            filtered = filtered.filter(c => c.filterCategory === 'InMail');
        } else if (this.currentFilter === 'Jobs') {
            filtered = filtered.filter(c => c.filterCategory === 'Jobs');
        } else if (this.currentFilter === 'Connections') {
            filtered = filtered.filter(c => c.filterCategory === 'Connections');
        } else if (this.currentFilter === 'Focused') {
            // Focused shows all
        }
        
        // Apply search
        if (this.searchQuery) {
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(this.searchQuery) ||
                c.messages.some(m => m.text.toLowerCase().includes(this.searchQuery))
            );
        }
        
        this.filteredConversations = filtered;
    }
    
    getRandomAvatarColor() {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return `0:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize game
let game = new RecruiterGame();


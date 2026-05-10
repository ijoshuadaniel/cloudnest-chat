# Futuristic AI Chat Application - Design Specification

## Project Overview
- **Project Name**: Nexus AI Chat
- **Project Type**: Premium AI Chat Web Application
- **Core Functionality**: Modern conversational AI interface with advanced visual design
- **Target Users**: Professionals seeking high-end AI assistant experience

---

## UI/UX Specification

### Layout Structure

#### Page Sections
1. **Left Sidebar** (280px width)
   - AI logo at top (centered, with glow effect)
   - "New Chat" button with gradient glow
   - Search input for chats
   - Chat history with sections (Recent, Pinned)
   - Bottom: Settings, Library icons, User profile card

2. **Main Chat Area** (flex-1)
   - Top: Sticky navigation with model selector dropdown + upgrade CTA
   - Center: Empty state with hero or conversation area
   - Floating chat input bar at bottom (centered, elevated)

3. **Chat Messages**
   - User messages: Right-aligned, gradient bubble
   - AI messages: Left-aligned, glassmorphism container with subtle border

#### Responsive Breakpoints
- Desktop: > 1024px (full sidebar)
- Tablet: 768px - 1024px (collapsible sidebar)
- Mobile: < 768px (overlay sidebar)

---

### Visual Design

#### Color Palette
- **Background**:
  - Primary: #050816 (deep black)
  - Secondary: #0B1020 (deep navy)
  - Gradient: linear-gradient(135deg, #050816 0%, #0B1020 50%, #0a0f1a 100%)

- **Accent Gradients**:
  - Purple-Blue: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)
  - Cyan-Indigo: linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)
  - Neon Purple: #A855F7 with 30% opacity glow
  - Neon Cyan: #22D3EE with 30% opacity glow

- **Text Colors**:
  - Primary: #FFFFFF
  - Secondary: #94A3B8 (soft gray)
  - Muted: #64748B (gray)

- **Borders/Glass**:
  - Glass border: rgba(255, 255, 255, 0.08)
  - Glass background: rgba(255, 255, 255, 0.03)
  - Hover glow: rgba(139, 92, 246, 0.15)

- **Interactive States**:
  - Hover: 0.15s ease with glow effect
  - Active: Scale 0.98, stronger glow

#### Typography
- **Font Family**: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif
- **Hero Heading**: 48px, font-weight: 600, letter-spacing: -0.02em
- **Subheading**: 18px, font-weight: 400, color: #94A3B8
- **Body Text**: 15px, font-weight: 400, line-height: 1.6
- **Small Text**: 13px, font-weight: 400

#### Spacing System
- Base unit: 4px
- Component padding: 16px (4 units)
- Section gaps: 24px (6 units)
- Card padding: 20px (5 units)
- Border radius: 12px (small), 16px (medium), 20px (large), 24px (xl)

#### Visual Effects
- **Glassmorphism**:
  - Background: rgba(255, 255, 255, 0.03)
  - Backdrop-filter: blur(20px)
  - Border: 1px solid rgba(255, 255, 255, 0.08)

- **Neon Glow**:
  - Box-shadow: 0 0 40px rgba(139, 92, 246, 0.3)
  - For buttons: 0 0 20px rgba(139, 92, 246, 0.4)

- **Background Effects**:
  - Ambient gradient orbs (blur: 150px, opacity: 0.4)
  - Subtle grid pattern (opacity: 0.02)
  - Noise texture overlay (opacity: 0.015)

- **Shadows**:
  - Card shadow: 0 4px 24px rgba(0, 0, 0, 0.4)
  - Elevated: 0 8px 32px rgba(0, 0, 0, 0.5)

---

### Components

#### 1. Sidebar Navigation
- **Logo**: Centered, 48px icon with purple-cyan glow
- **New Chat Button**: Full width, gradient background, 44px height, 12px radius
- **Search**: Full width, 40px height, glassmorphism background
- **Chat List Items**:
  - Height: 48px
  - Hover: subtle background + left border glow
  - Active: gradient left border + subtle glow
- **Icons**: 20px, stroke width 1.5, color: #64748B

#### 2. Top Navigation Bar
- **Height**: 56px
- **Model Selector**: Dropdown with current model, glassmorphism style
- **Upgrade CTA**: Gradient button with glow, right-aligned

#### 3. Hero Section (Empty State)
- **Heading**: "How can I help you today?"
- **Subheading**: "Nexus is ready to assist. Start a conversation."
- **Suggestion Cards**: 3 cards in a row
  - Icons: 24px with gradient
  - Text: 14px, medium weight
  - Hover: lift + glow effect

#### 4. Chat Input Bar
- **Style**: Floating, elevated, glassmorphism
- **Width**: max 720px, centered
- **Height**: 56px (expandable)
- **Border**: 1px solid rgba(255,255,255,0.1)
- **Shadow**: 0 8px 32px rgba(0,0,0,0.4)
- **Inner Elements**:
  - Textarea: transparent background
  - Attachment button: left side
  - Voice button: right side
  - Send button: gradient, right side

#### 5. Message Bubbles
- **User Message**:
  - Right-aligned
  - Background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)
  - Max-width: 70%
  - Border-radius: 20px 20px 4px 20px

- **AI Message**:
  - Left-aligned
  - Background: glassmorphism (rgba(255,255,255,0.03))
  - Border: 1px solid rgba(255,255,255,0.08)
  - Max-width: 80%
  - Border-radius: 20px 20px 20px 4px

#### 6. Message Actions (per message)
- Icons: copy, regenerate, thumbs up/down, audio
- Appears on hover, fades in

#### 7. Typing Indicator
- 3 animated dots with stagger animation
- Gradient colors

#### 8. AI Tools Row
- Horizontal row of tool buttons
- Icons: Search, Reason, Code, Image, Voice
- Pill-shaped, glassmorphism style

---

## Functionality Specification

### Core Features
1. **Sidebar Navigation**
   - Logo click returns home
   - New chat creates fresh conversation
   - Search filters chat history
   - Click chat loads conversation
   - Settings opens settings view

2. **Model Selection**
   - Dropdown in top nav
   - Shows current model
   - Changes active model

3. **Message Input**
   - Text input with placeholder
   - Attachment support (icons)
   - Voice input button
   - Send on Enter (Shift+Enter for new line)
   - Typing indicator during response

4. **Suggestion Cards**
   - Click sends preset prompt
   - Hover lifts and glows

5. **Message Display**
   - Streaming text animation
   - Copy on click
   - Regenerate for last AI message
   - Feedback buttons

### User Interactions
- Hover states on all interactive elements
- Smooth transitions (150ms)
- Focus states with glow ring
- Scroll to bottom on new messages

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Deep navy/black gradient background visible
- [ ] Glassmorphism panels with blur effect
- [ ] Neon glow on accent elements (purple/cyan)
- [ ] 20px+ border radius on cards and buttons
- [ ] Smooth hover animations
- [ ] Floating chat input with elevated shadow
- [ ] User messages right with gradient
- [ ] AI messages left with glassmorphism

### Functional Checkpoints
- [ ] New chat button works
- [ ] Chat history displays
- [ ] Model selector changes model
- [ ] Message input accepts text
- [ ] Send button triggers message
- [ ] Suggestion cards trigger messages
- [ ] Empty state shows hero + suggestions

---

## Technical Implementation

- Single HTML file with embedded CSS and JS
- CSS custom properties for theming
- CSS animations for effects (no external dependencies)
- Clean semantic HTML structure
- Mobile responsive design
- Performance optimized (minimal DOM, efficient CSS)
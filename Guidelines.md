# CineStory Film Ecosystem - Design Guidelines

## Overview
CineStory is a holographic, minimal film ecosystem platform that connects the entire film industry from pre-production to distribution. The design emphasizes precision, trust, and cinematic excellence through clean interfaces and sophisticated visual effects.

---

## General Design Principles

### Minimal & Clean
* **Less is More**: Each interface element should serve a clear purpose
* **Breathing Room**: Use generous whitespace and padding for clarity
* **Typography Hierarchy**: Clear information hierarchy without visual clutter
* **Progressive Disclosure**: Show only what users need to see at each step

### Holographic & Cinematic
* **Subtle Animations**: All animations should feel smooth and purposeful
* **Glowing Effects**: Use text shadows and border glows sparingly for accent colors
* **Grid Backgrounds**: Animated grid patterns for visual depth without distraction
* **Film-Industry Inspired**: Visual metaphors from actual film production workflows

### Professional & Trustworthy
* **Consistent Color Usage**: Stick to the defined accent palette
* **Clear Action States**: Hover, active, and disabled states should be obvious
* **Reliable Interactions**: Every click should provide clear feedback
* **Industry Standards**: Follow film industry conventions where applicable

---

## Color System

### Primary Accents
```
blue: "#6bc7ff"        // Studio & Production
magenta: "#ff5cc7"     // AI/AutoCut Features  
cyan: "#00fff2"        // Audio & Distribution
nebula1: "#8a7cff"     // Color Grading (Primary)
nebula2: "#5ad1ff"     // Color Grading (Secondary)
nebula3: "#c27dff"     // Color Grading (Tertiary)
audioWave: "#a7e4ff"   // Audio Waveforms
audioLocator: "#5fc6ff" // Audio Playheads
teal: "#7fd9c8"        // Ecosystem Tools
gray: "#bfc7d1"        // Neutral/Secondary Tools
```

### Usage Rules
* **One Accent Per Tool**: Each major tool gets one primary accent color
* **Consistent Mapping**: Studio=Blue, AutoCut=Magenta, Color=Nebula, Audio=AudioWave
* **Glow Effects**: Use `textShadow: 0 0 10px ${accent}` for titles
* **Subtle Borders**: Use `boxShadow: 0 0 0 1px ${accent}55` for panels

---

## Typography

### Font Hierarchy
* **Headlines**: Use default h1-h4 from global CSS (no Tailwind text classes)
* **Body Text**: Default p styling with neutral-400 for descriptions
* **Labels**: Small text (text-xs, text-sm) for metadata and secondary info
* **Code/Technical**: Monospace only for actual code or technical identifiers

### Rules
* **Never Override Base Typography**: Don't use text-2xl, font-bold, etc. unless specifically requested
* **Consistent Line Heights**: Stick to 1.5 line-height from global CSS
* **Color Consistency**: Use accent colors for main titles, neutral colors for descriptions

---

## Layout & Spacing

### Grid System
* **4-Column Grid**: Main tools in lg:grid-cols-4 layout
* **Responsive Breakpoints**: sm, md, lg, xl following Tailwind defaults
* **Centered Content**: Use `grid place-items-center` for main layouts
* **Max Width Constraints**: 75vw max-width for main content areas

### Spacing Scale
* **Component Padding**: p-6 for main content areas
* **Gap Spacing**: gap-8 for main grids, gap-4 for smaller elements
* **Margin Scale**: Use mb-4, mb-8, mt-8 for consistent vertical rhythm

---

## Component Guidelines

### HologramPanel
* **Aspect Ratio**: Always 16:9 for video preview areas
* **Rounded Corners**: rounded-2xl for main panels
* **Background**: bg-[#0e1013]/90 with subtle transparency
* **Hover Effects**: Subtle scale and glow on hover
* **Animation Areas**: Each tool type has unique animations in preview area

### SmallTool Buttons
* **Pill Shape**: rounded-full for compact tools
* **Subtle Glow**: Box shadow with accent color
* **Consistent Size**: Small text (text-[11px]) with dot indicators
* **Hover States**: Slight background darkening

### Cards & Panels
* **Consistent Borders**: border-white/10 for dark theme
* **Hover States**: border-white/20 on hover
* **Background**: bg-[#0e1013]/90 or bg-[#0e1013]/50 for transparency levels
* **Corner Radius**: rounded-lg for cards, rounded-2xl for main panels

---

## Animation & Interactions

### Animation Principles
* **Subtle Motion**: 8s+ duration for ambient animations
* **Purposeful Movement**: Each animation should suggest the tool's function
* **Consistent Easing**: ease-in-out for most transitions
* **Performance**: Use CSS transforms, avoid animating layout properties

### Tool-Specific Animations
* **Studio**: Timeline scrolling with playhead indicator
* **AutoCut**: Waveform analysis with cutting indicators  
* **Color**: Node graph with flowing connections
* **Audio**: Fine waveform with scanning locators

### Interaction States
* **Hover**: opacity changes, subtle scaling (scale-105), border brightening
* **Active**: Immediate visual feedback
* **Loading**: Consistent loading patterns across tools
* **Focus**: Clear focus rings for accessibility

---

## Content Guidelines

### Naming Conventions
* **Tool Names**: Always end with ™ symbol (e.g., CineStory Studio™)
* **Descriptions**: Concise, action-oriented language
* **Industry Terms**: Use actual film industry terminology
* **Bilingual Support**: EN/TH language switching support

### Tone & Voice
* **Professional**: Industry-grade language
* **Precise**: Clear, technical descriptions
* **Trustworthy**: Emphasize reliability and precision
* **Accessible**: Complex concepts explained simply

---

## Technical Standards

### File Organization
* **Component Separation**: Each major feature in its own component file
* **UI Components**: Use shadcn/ui components from /components/ui
* **Custom Components**: Place in /components/ directory
* **Utilities**: Helper functions in separate files

### Performance Guidelines
* **Animation Performance**: Use CSS transforms and opacity for animations
* **Lazy Loading**: Load heavy components only when needed
* **State Management**: Minimal state, prefer derived state
* **Bundle Size**: Keep dependencies lightweight

### Accessibility
* **Keyboard Navigation**: All interactive elements must be keyboard accessible
* **Color Contrast**: Ensure sufficient contrast for all text
* **Focus Indicators**: Clear focus states for all interactive elements
* **Screen Reader Support**: Proper ARIA labels and semantic HTML

---

## Responsive Design

### Breakpoints
* **Mobile First**: Start with mobile layout
* **Tablet**: md: breakpoint adjustments
* **Desktop**: lg: full 4-column layout
* **Large Screens**: xl: enhanced spacing

### Layout Adaptations
* **Grid Collapse**: 4→2→1 columns on smaller screens
* **Text Scaling**: Consistent scaling across breakpoints
* **Touch Targets**: Minimum 44px touch targets on mobile
* **Spacing Adjustments**: Reduce padding/margins on smaller screens

---

## Future Considerations

### Extensibility
* **New Tools**: Follow existing accent color and animation patterns
* **New Features**: Maintain minimal aesthetic
* **Ecosystem Growth**: Plan for additional industry connections
* **Internationalization**: Support for multiple languages and regions

### Integration Points
* **Supabase Integration**: User auth, project storage, collaboration
* **External APIs**: Film databases, distribution networks, analytics
* **Third-party Tools**: Industry-standard software integrations
* **Mobile Apps**: Companion mobile applications for on-set use
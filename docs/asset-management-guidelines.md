# Asset Management Guidelines

## Overview
This document defines the naming conventions, folder structure, and organization standards for all content assets in the Korean Language Learning Application.

## Folder Structure

### Root Asset Directory
```
public/assets/
├── audio/
│   ├── lessons/
│   ├── exercises/
│   ├── pronunciation/
│   └── ui/
├── images/
│   ├── lessons/
│   ├── exercises/
│   ├── ui/
│   └── charts/
├── videos/
│   ├── lessons/
│   └── tutorials/
└── fonts/
    └── korean/
```

## Naming Conventions

### General Rules
1. Use lowercase letters only
2. Use hyphens (-) to separate words
3. Use underscores (_) to separate logical sections
4. Include version numbers when applicable
5. Use descriptive, meaningful names

### Audio Files

#### Lesson Audio
- **Format**: `lesson-{lesson-id}_{content-type}_{index}.{ext}`
- **Examples**:
  - `lesson-001_intro_01.mp3`
  - `lesson-001_example_02.mp3`
  - `lesson-002_pronunciation_01.mp3`

#### Character/Sound Audio
- **Format**: `char_{character}_{variant}.{ext}`
- **Examples**:
  - `char_g_basic.mp3`
  - `char_a_basic.mp3`
  - `char_ga_combined.mp3`

#### Exercise Audio
- **Format**: `exercise_{lesson-id}_{exercise-type}_{index}.{ext}`
- **Examples**:
  - `exercise_001_quiz_01.mp3`
  - `exercise_002_pronunciation_01.mp3`

#### UI Audio
- **Format**: `ui_{action}_{variant}.{ext}`
- **Examples**:
  - `ui_success_01.mp3`
  - `ui_error_01.mp3`
  - `ui_click_01.mp3`

### Image Files

#### Lesson Images
- **Format**: `lesson-{lesson-id}_{content-type}_{description}.{ext}`
- **Examples**:
  - `lesson-001_chart_hangul-overview.jpg`
  - `lesson-002_diagram_vowel-positions.png`

#### Exercise Images
- **Format**: `exercise_{lesson-id}_{exercise-type}_{description}.{ext}`
- **Examples**:
  - `exercise_001_flashcard_front.png`
  - `exercise_002_matching_option-a.jpg`

#### UI Images
- **Format**: `ui_{component}_{state}_{variant}.{ext}`
- **Examples**:
  - `ui_button_hover_primary.png`
  - `ui_icon_play_default.svg`
  - `ui_background_lesson_01.jpg`

#### Charts and Diagrams
- **Format**: `chart_{type}_{description}_{version}.{ext}`
- **Examples**:
  - `chart_hangul_complete-alphabet_v1.png`
  - `chart_grammar_sentence-structure_v2.svg`

### Video Files

#### Lesson Videos
- **Format**: `lesson-{lesson-id}_{content-type}_{description}.{ext}`
- **Examples**:
  - `lesson-001_intro_welcome.mp4`
  - `lesson-003_tutorial_writing-practice.mp4`

#### Tutorial Videos
- **Format**: `tutorial_{topic}_{section}_{version}.{ext}`
- **Examples**:
  - `tutorial_pronunciation_mouth-positions_v1.mp4`
  - `tutorial_writing_stroke-order_v2.mp4`

### Font Files
- **Format**: `{font-name}_{weight}_{style}.{ext}`
- **Examples**:
  - `noto-sans-kr_regular_normal.woff2`
  - `noto-sans-kr_bold_normal.woff2`

## File Size Guidelines

### Audio Files
- **Lesson audio**: Max 5MB per file
- **Character sounds**: Max 500KB per file
- **UI sounds**: Max 100KB per file
- **Format**: MP3 (128kbps) or OGG Vorbis

### Image Files
- **Lesson images**: Max 2MB per file
- **UI images**: Max 500KB per file
- **Icons**: Max 50KB per file (prefer SVG)
- **Format**: JPEG (photos), PNG (graphics), SVG (icons)

### Video Files
- **Lesson videos**: Max 50MB per file
- **Tutorial videos**: Max 100MB per file
- **Format**: MP4 (H.264)

## Quality Standards

### Audio Quality
- **Sample Rate**: 44.1kHz minimum
- **Bit Depth**: 16-bit minimum
- **Channels**: Mono for speech, Stereo for music
- **Noise Floor**: -60dB or lower

### Image Quality
- **Resolution**: Minimum 1920x1080 for lesson images
- **DPI**: 72 DPI for web, 300 DPI for print materials
- **Color Space**: sRGB
- **Compression**: Optimize for web without visible quality loss

### Video Quality
- **Resolution**: 1920x1080 (1080p) minimum
- **Frame Rate**: 30fps
- **Codec**: H.264 with AAC audio
- **Bitrate**: 2-5 Mbps for 1080p

## Version Control

### Versioning System
- Use semantic versioning for major asset updates
- **Format**: `{asset-name}_v{major}.{minor}.{patch}.{ext}`
- **Examples**:
  - `chart_hangul_complete_v1.0.0.png`
  - `lesson-001_intro_v2.1.0.mp3`

### Update Process
1. Create new version with incremented number
2. Update references in lesson JSON files
3. Keep previous version for 30 days before removal
4. Document changes in asset changelog

## Content Organization

### Lesson-Based Organization
- Group assets by lesson ID for easy maintenance
- Use consistent numbering across all asset types
- Maintain parallel structure between lessons and assets

### Category-Based Organization
- Separate assets by type (audio, images, videos)
- Use subcategories for specific content types
- Enable efficient caching and loading strategies

## Metadata Requirements

### Required Metadata
- **Creation Date**: ISO 8601 format
- **Creator**: Author/source information
- **License**: Usage rights and restrictions
- **Description**: Brief content description
- **Tags**: Searchable keywords
- **Lesson Association**: Related lesson IDs

### Metadata Storage
- Store metadata in JSON sidecar files
- **Format**: `{asset-name}.meta.json`
- Include in asset validation pipeline

## Security Considerations

### Access Control
- Implement proper CORS policies
- Use secure asset delivery methods
- Protect premium content with authentication

### Content Protection
- Add basic watermarking for images
- Use secure streaming for premium videos
- Implement download restrictions where needed

## Performance Optimization

### Loading Strategies
- Implement lazy loading for non-critical assets
- Use progressive loading for large images
- Preload critical audio files

### Caching Policies
- Set appropriate cache headers
- Use CDN for global asset delivery
- Implement browser caching strategies

### Compression
- Use modern image formats (WebP, AVIF) when supported
- Implement audio compression without quality loss
- Optimize video encoding for streaming

## Maintenance Procedures

### Regular Audits
- Monthly asset inventory and cleanup
- Quarterly quality assurance reviews
- Annual naming convention updates

### Cleanup Process
- Remove unused assets after lesson updates
- Archive old versions according to retention policy
- Monitor storage usage and optimize as needed

### Documentation Updates
- Update guidelines when new asset types are added
- Maintain changelog of naming convention changes
- Review and update quality standards annually

## Implementation Checklist

- [ ] Create folder structure in public/assets/
- [ ] Implement asset validation pipeline
- [ ] Set up metadata storage system
- [ ] Configure CORS policies
- [ ] Implement compression pipeline
- [ ] Set up monitoring and analytics
- [ ] Create asset management tools
- [ ] Document maintenance procedures

## Tools and Automation

### Recommended Tools
- **Image Optimization**: ImageOptim, TinyPNG
- **Audio Processing**: Audacity, FFmpeg
- **Video Encoding**: HandBrake, FFmpeg
- **Batch Processing**: Custom Node.js scripts

### Automation Scripts
- Asset validation and naming verification
- Automatic compression and optimization
- Metadata generation and validation
- Broken link detection and reporting

---

**Last Updated**: July 25, 2025
**Version**: 1.0.0
**Maintained By**: Development Team
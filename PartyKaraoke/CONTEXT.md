# Karaoke App Specification

A dual-mode karaoke application that functions as both a standalone player and remote controller. The app enables YouTube-based karaoke with device synchronization through QR codes.

## Core Modes

### Screen Mode (Main Display)
- **Desktop**: Full-screen player with QR code for pairing
- **Mobile**: Split view with player and queue management

### Remote Mode (Controller)
- QR scanner for pairing
- Song search and queue management
- Playback controls

## User Flows

### Screen Mode Flow
1. Launch app
2. Select Screen Mode
3. Choose device type:
   - **Desktop**: Shows full-screen player + QR code
   - **Mobile**: Shows player + queue management

### Remote Mode Flow
1. Launch app
2. Select Remote Mode
3. Scan QR code from main device
4. Access remote control interface

## Features

### Video Player
- YouTube integration
- Basic playback controls (play/pause/skip/volume)
- Queue management

### Device Pairing
- QR code generation (Screen Mode)
- QR code scanning (Remote Mode)
- Real-time WebSocket synchronization

### Queue Management
- YouTube search integration
- Add/remove songs
- Queue reordering
- Real-time updates across devices

## Technical Stack

### Frontend
- Responsive design for all screen sizes
- WebSocket client for real-time updates
- YouTube API integration
- QR code handling

### Backend
- WebSocket server for device communication
- YouTube data API integration
- Session management
- Queue state management

## Database Schema

### Tables

#### users
- id: UUID (Primary Key)
- username: VARCHAR(50) UNIQUE
- email: VARCHAR(100) UNIQUE
- password_hash: VARCHAR(255)
- created_at: TIMESTAMP
- last_login: TIMESTAMP

#### rooms
- id: UUID (Primary Key)
- name: VARCHAR(100)
- host_id: UUID (Foreign Key -> users.id)
- is_active: BOOLEAN
- created_at: TIMESTAMP
- last_active: TIMESTAMP

#### room_participants
- id: UUID (Primary Key)
- room_id: UUID (Foreign Key -> rooms.id)
- user_id: UUID (Foreign Key -> users.id)
- role: ENUM('host', 'controller', 'viewer')
- joined_at: TIMESTAMP

#### queue_items
- id: UUID (Primary Key)
- room_id: UUID (Foreign Key -> rooms.id)
- youtube_video_id: VARCHAR(20)
- title: VARCHAR(200)
- added_by: UUID (Foreign Key -> users.id)
- position: INTEGER
- status: ENUM('pending', 'playing', 'completed')
- added_at: TIMESTAMP

#### user_preferences
- user_id: UUID (Foreign Key -> users.id)
- theme: ENUM('light', 'dark')
- volume_preference: INTEGER
- accessibility_settings: JSONB

## Project Structure

## Implementation Notes

### Performance Considerations
- Minimize latency between devices
- Efficient video loading
- Smooth queue updates

### Security
- Secure device pairing
- Session management
- Rate limiting for YouTube API

### Accessibility
- Screen reader support
- Keyboard navigation
- High contrast options

---
*For technical implementation details, see the accompanying development documentation.*

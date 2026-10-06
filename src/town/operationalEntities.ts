import type { TownEntity } from './townData';

// Feature landmarks belong to existing modules; they are not new backend services.
export const operationalEntities: readonly TownEntity[] = [
    {
        "id": "booking-intake",
        "name": "Booking Intake Lockhouse",
        "kind": "service",
        "tier": "business",
        "status": "operational",
        "shape": "platform",
        "clusterId": "services",
        "position": [
            -45,
            0,
            390
        ],
        "size": [
            58,
            64,
            54
        ],
        "color": "#57c7b5",
        "accentColor": "#f4fff9",
        "summary": "A lockhouse gathers missing details before a quote or booking confirmation can pass.",
        "details": {
            "purpose": "Ask targeted follow-up questions while preserving selected activity, time, and quote.",
            "systemRole": "Slot-filling capability of booking chatbot orchestration, not a separate booking engine.",
            "flows": [
                "Collect missing required details",
                "Retain activity, time, and chosen quote",
                "Propose price or confirm only after intake is complete"
            ],
            "reliability": [
                "Three lit gates represent required context",
                "Intake remains connected to availability and orchestration"
            ],
            "related": [
                "Booking Management",
                "Chatbot Orchestration",
                "Weekly Allotment Observatory"
            ]
        },
        "connections": [
            "booking-management",
            "chatbot-orchestration",
            "weekly-allotment-observatory"
        ]
    },
    {
        "id": "inbox-case-board",
        "name": "Casework Arcade",
        "kind": "service",
        "tier": "business",
        "status": "operational",
        "shape": "platform",
        "clusterId": "communications",
        "position": [
            -430,
            0,
            -125
        ],
        "size": [
            112,
            76,
            68
        ],
        "color": "#5eabb8",
        "accentColor": "#f4fff9",
        "summary": "A configurable casework arcade with hideable, reorderable lanes and tagged customer cards.",
        "details": {
            "purpose": "Create and track customer cases from Inbox conversations when Case Management is enabled.",
            "systemRole": "Inbox case-management capability linked to the existing issue-management module.",
            "flows": [
                "Create a case from a conversation",
                "Assign an owner and follow through closure",
                "Browse mine, unassigned, followed, team, and status views",
                "Account admins choose visible lanes and their order",
                "Show conversation tags beneath concise customer card titles",
                "Adapt the toolbar to the available screen width"
            ],
            "reliability": [
                "Account administrator enables Case Management",
                "Cases stay connected to conversation context",
                "Use customer portraits when available; colored initials when absent",
                "Lane display preferences do not change case status or remove cases"
            ],
            "related": [
                "Unified Inbox",
                "Issue Management",
                "Auth Service",
                "Database Cluster"
            ]
        },
        "connections": [
            "unified-inbox",
            "issue-management",
            "auth-service",
            "database-cluster"
        ]
    },
    {
        "id": "case-report-clock",
        "name": "Business Hours Clock",
        "kind": "service",
        "tier": "business",
        "status": "operational",
        "shape": "platform",
        "clusterId": "communications",
        "position": [
            -300,
            0,
            -135
        ],
        "size": [
            50,
            72,
            50
        ],
        "color": "#edc66a",
        "accentColor": "#f4fff9",
        "summary": "A staffed clockhouse measures case response and resolution during configured business hours.",
        "details": {
            "purpose": "Show open and unassigned cases, staff availability, and business-hours service metrics.",
            "systemRole": "Reporting view of Inbox Case Management.",
            "flows": [
                "Report open and unassigned workloads",
                "Show agent availability",
                "Measure response and closure within configured working hours"
            ],
            "reliability": [
                "Clock face distinguishes working time from elapsed time",
                "Reports share the existing case source"
            ],
            "related": [
                "Casework Arcade",
                "Monitoring Tower"
            ]
        },
        "connections": [
            "inbox-case-board",
            "monitoring-tower"
        ]
    },
    {
        "id": "website-widget-studio",
        "name": "Website Welcome Court",
        "kind": "integration",
        "tier": "business",
        "status": "operational",
        "shape": "platform",
        "clusterId": "communications",
        "position": [
            -665,
            0,
            -115
        ],
        "size": [
            94,
            72,
            64
        ],
        "color": "#b19ce8",
        "accentColor": "#f4fff9",
        "summary": "Independent branded welcome kiosks with desktop and mobile previews for each website.",
        "details": {
            "purpose": "Create multiple widgets, copy each installation snippet, and manage or delete each independently.",
            "systemRole": "Website chat integration configured through Admin Integrations.",
            "flows": [
                "Create independent website widgets",
                "Copy per-website embed code",
                "Manage and delete individual widgets",
                "Customize header, welcome, color, and logo for each website",
                "Configure starter keyword buttons",
                "Preview desktop and mobile before copying installation code"
            ],
            "reliability": [
                "Distinct kiosks keep website identity separate",
                "All conversations enter the Unified Inbox",
                "Per-website customization does not overwrite neighboring widgets"
            ],
            "related": [
                "Unified Inbox",
                "Partner Exchange",
                "Auth Service"
            ]
        },
        "connections": [
            "unified-inbox",
            "partner-exchange",
            "auth-service"
        ]
    },
    {
        "id": "catalog-import-depot",
        "name": "Marketplace Catalog Depot",
        "kind": "integration",
        "tier": "business",
        "status": "operational",
        "shape": "platform",
        "clusterId": "integrations",
        "position": [
            -545,
            0,
            -290
        ],
        "size": [
            112,
            70,
            72
        ],
        "color": "#ef9d58",
        "accentColor": "#f4fff9",
        "summary": "Three loading bays import complete Shopee, Lazada, and TikTok Shop product catalogs.",
        "details": {
            "purpose": "Preview a full catalog import, start it once, follow progress, and see completion.",
            "systemRole": "Admin marketplace catalog-import capability within partner integrations.",
            "flows": [
                "Preview catalog items before starting",
                "Import the entire connected marketplace catalog",
                "Track progress and completion"
            ],
            "reliability": [
                "Three named bays preserve marketplace boundaries",
                "Products flow through partner integrations to owned records"
            ],
            "related": [
                "Partner Exchange",
                "Omnichat Browser Bridge",
                "Lazada Channel",
                "Database Cluster"
            ]
        },
        "connections": [
            "partner-exchange",
            "shopee-browser-bridge",
            "lazada-channel",
            "database-cluster"
        ]
    },
    {
        "id": "preset-reply-workshop",
        "name": "Four Message Printshop",
        "kind": "service",
        "tier": "business",
        "status": "operational",
        "shape": "platform",
        "clusterId": "communications",
        "position": [
            -560,
            0,
            -125
        ],
        "size": [
            74,
            66,
            60
        ],
        "color": "#e8b6c8",
        "accentColor": "#f4fff9",
        "summary": "An ordered print rack assembles up to four text and image messages for the Inbox composer.",
        "details": {
            "purpose": "Compose, delete, and reorder mixed text/image preset replies while preserving older text-only replies.",
            "systemRole": "Reply templates in the human-operated Inbox composer, sent through the existing message queue.",
            "flows": [
                "Create a sequence of up to four text or image messages",
                "Delete or reorder entries",
                "Insert the sequence into the reply composer",
                "Continue editing existing text-only presets"
            ],
            "reliability": [
                "Sequence order stays visible on four numbered shelves",
                "An X on the image preview marks its close control",
                "A braced narrow console represents stable Android sidebar opening"
            ],
            "related": [
                "Unified Inbox",
                "Message Queue",
                "Object Storage",
                "Image Server"
            ]
        },
        "connections": [
            "unified-inbox",
            "message-queue",
            "object-storage",
            "image-server"
        ]
    },
    {
        "id": "staff-notification-belfry",
        "name": "Staff Notification Belfry",
        "kind": "service",
        "tier": "business",
        "status": "operational",
        "shape": "tower",
        "clusterId": "communications",
        "position": [
            -425,
            0,
            -290
        ],
        "size": [
            62,
            86,
            58
        ],
        "color": "#ed839f",
        "accentColor": "#f4fff9",
        "summary": "A grounded bell tower announces new messages, cases, urgent items, and assignments.",
        "details": {
            "purpose": "Let staff select in-app and Web Push alerts by category and chat scope.",
            "systemRole": "Inbox staff-notification preferences and bell center, connected to the existing Notification Hub.",
            "flows": [
                "Receive new customer-message notifications",
                "Surface case, urgent-item, and assignment alerts in the bell center",
                "Select in-app or Web Push per category and chat scope"
            ],
            "reliability": [
                "Scoped preferences avoid indiscriminate fan-out",
                "Staff alerts remain distinct from customer verification results"
            ],
            "related": [
                "Unified Inbox",
                "Casework Arcade",
                "Notification Hub",
                "Auth Service"
            ]
        },
        "connections": [
            "unified-inbox",
            "inbox-case-board",
            "notification-hub",
            "auth-service"
        ]
    }
];

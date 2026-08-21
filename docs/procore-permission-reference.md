# Procore permission structure — reference

**Reference only. Nothing here is applied automatically.** This exists so that whoever authors
a new tool template has the real Procore tool names and the real granular permission wording in
front of them, instead of guessing.

- **Source:** a Procore project permission template edit screen, captured 21 Aug 2026 from a
  live US02 instance. Template shown: *Architect/Engineer - External*.
- **Held at:** `docs/reference/procore-permission-template-architect-engineer-external-2026-08-21.pdf`
- **Caveat:** this is one company's configuration of one template. The **structure** below (tool
  names, categories, granular permission wording) is the reusable part. Tool availability varies
  by company, and Procore adds and renames tools — re-capture this when it matters.

---

## The four permission levels

Every tool is set to exactly one of:

| Level | Meaning |
|---|---|
| **None** | The tool is not visible to this user |
| **Read-only** | Can view, cannot create or change |
| **Standard** | Can create and work items they own |
| **Admin** | Full control of the tool including its configuration |

Some tools offer only a subset of the four — several in this capture have no Read-only or no
Standard column available.

**Granular permissions sit underneath a level.** They appear as a nested checklist once a tool is
set to Read-only or Standard, and each one adds a specific ability on top of that level. They are
not a level of their own. This is why a template can read "Standard + Act as RFI manager".

---

## Tools by category

Names below are exactly as Procore displays them in this instance. Note the **Australian/NZ
vocabulary** — Head Contracts, Variations, Defect List, Site Diary, Progress Claim — which is what
the SOP templates are authored in.

### Core Tools
360 Reporting · Admin · Agent Builder · Assets *(beta)* · Assist *(beta)* · Correction Manager ·
Directory · **Documents** · Home · Locations *(beta)* · Maps *(beta)* · Project archive *(beta)* ·
Roles · Tasks · Webhooks API

### Project Management
**Action Plans** · Coordination Issues · **Defect List** · Document Management · Document
Management workflows · **Drawings** · Emails · Forms · Incidents · Incidents workflows ·
Inspections · Instructions · **Meetings** · Models · Observations · **Photos** · Program *(legacy)* ·
Programming *(new)* · **RFIs** · Site Diary · **Specifications** · **Submittals** · Transmittals

### Financial Management
Budget · Budget change workflows · Change Events · Commitments · Commitments workflows ·
Direct cost workflows · Direct Costs · Head Contracts · Head contracts workflows · Variations

### Resource Management
Daywork Sheets · Equipment · Equipment *(legacy)* · Materials *(new)* · Resource planning ·
Site Teams · Timesheets

### Preconstruction
Estimating · Tendering

### Correspondence types & Custom Tools
Each of these also has a matching *workflows* entry:

Approval to Issue Instruction · Client Instruction · Early Warning Notice · Extension of Time ·
General Correspondence · Letters of Intent · Progress Claim · Site Instruction · Variation Request

**Tools shown in bold above are the ones that expose granular permissions.** Their granular lists
follow.

---

## Granular permissions

### RFIs
- Act as RFI manager
- Mark official responses
- View external items
- View private RFIs associated to users within same company
- View project RFI insights

> The RFI master library currently uses only *Act as RFI manager*. The other four are available
> and unused — worth reviewing when the RFI library is verified.

### Submittals
- Create submittal
- Create submittal package
- View private submittals associated to users within same company
- View connected submittals
- Apply submittal workflow template
- View project submittal insights

### Specifications
- View specifications
- Upload specifications
- Show all uploads
- Delete pending uploads
- Review specifications
- Publish specifications
- Update specifications
- Email specifications
- Relate items
- Export specifications
- Download specifications
- View download register
- View change history
- View all revisions
- Delete specifications
- View deleted specifications
- Manually create divisions
- Manually create specifications
- Create specification sets
- Configure Specifications tool
- Edit, create and delete public markup layers

### Documents
- Access private folders and files
- Rename folders and files
- Move and copy files and folders
- Set permissions
- Delete folders and files
- See recycle bin
- Edit, create and delete public markup layers

### Action Plans
- Sign as action plan approver
- Sign as completed action plan receiver
- Add record requests to published plans as assignee
- Create and edit action plan
- Delete action plan
- Edit due date in published plans
- Edit item notes as action plans assignee
- Edit item status as action plans assignee
- Edit notifications
- Create and edit project templates
- Add records
- Sign as action plan assignee for any user
- Sign as action plan approver for users within the same company
- Sign as action plan assignee for users within the same company
- Sign as completed action plan receiver for users within the same company
- Sign as action plan assignee
- Remove records

### Meetings
- Add comment to meeting
- Delete own comment on a meeting
- Create meeting
- Distribute meeting
- Update meeting
- Manage meeting items
- Manage meeting categories
- Manage related items for meetings
- Email meeting

### Defect List
- View private defect items assigned to users within same company
- Respond to defect items assigned to users within same company
- View project defect list insights
- Manage project saved views

### Photos
- Delete a photo album
- Change the order of photo albums
- View private photos
- Create a photo album

### Drawings
- Upload drawings
- Upload and review drawings

---

## How to use this when authoring a tool template

1. Take the granular list for the tool from this document, or re-capture it from the client's own
   instance if their configuration differs.
2. Tag each block in the master library with `_perm`: the minimum level, plus the granular
   permission if one is required. Use Procore's exact wording so the Studio's Permissions step and
   the client's screen agree.
3. Anything that depends on how the client has configured Procore — rather than on a permission —
   is an **ask**, not a rule. Mark it so the reviewer decides.

**Do not treat this document as the permissions matrix.** It records what the tools and granular
options are called, not what each level lets a user do. Behaviour must still be verified against
Procore's APAC support documentation before a template is released.

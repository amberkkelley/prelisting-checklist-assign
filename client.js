/* global TrelloPowerUp */

const CHECKLIST_NAME = "Pre Listing Checklist";
const CUSTOM_FIELD_NAME = "Live Date";

const CHECKLIST_CONFIG = {
  "Create property folder in Google Drive (label = full address) and upload signed LA": { member: "abby", daysBefore: 10 },
  "Add subfolders: COGS, Photos, Graphics, and Contracts": { member: "abby", daysBefore: 10 },
  "Ensure client is in Lofty as a lead, and listing agent is assigned": { member: "abby", daysBefore: 10 },
  "Start MLS draft and begin entering listing details": { member: "abby", daysBefore: 10 },
  "Complete Listing Input Sheet": { member: "abby", daysBefore: 10 },
  "Send Listing Input sheet for seller signing (save signed copy in folder)": { member: "abby", daysBefore: 10 },
  "Order PR (preliminary title), plat map & tax data": { member: "abby", daysBefore: 10 },
  "Send Listing Agreement and MLS draft to Title (ERS)": { member: "abby", daysBefore: 10 },
  "Order HOA documents (if applicable)": { member: "abby", daysBefore: 10 },
  "Deliver flag, lockbox, and contractor box to property": { member: "agent", daysBefore: 10 },
  "Coordinate keys with seller": { member: "agent", daysBefore: 10 },
  "Schedule staging": { member: "agent", daysBefore: 10 },
  "Schedule photography (after staging complete)": { member: "abby", daysBefore: 9 },
  "Add photo appointment to LA’s calendar": { member: "abby", daysBefore: 9 },
  "Send seller confirmation of photo appointment": { member: "abby", daysBefore: 9 },
  "Inform photographer and stager of contractor box code": { member: "agent", daysBefore: 9 },
  "Assign supra lockbox to showingtime": { member: "amber", daysBefore: 3 },
  "Edit showingtime instructions and notification preferences / confirm with listing agent": { member: "amber", daysBefore: 3 },
  "(If owner/tenant occupied) send seller/tenant showingtime instruction email": { member: "abby", daysBefore: 3 },
  "Schedule sign installation for live date morning": { member: "abby", daysBefore: 3 },
  "Confirm staging is complete": { member: "abby", daysBefore: 3 },
  "Confirm photos are complete": { member: "abby", daysBefore: 3 },
  "Pay photo invoice / save to COGS folder": { member: "amber", daysBefore: 3 },
  // Add more items here if needed
};

const MEMBER_IDS = {
  abby: "6644e3b205a89d31a0303ea2",
  amber: "67871bc141d0919aba6298f9"
};

function assignChecklistItems(t, cardId, checklistId, cardMembers, liveDateStr) {
  const liveDate = liveDateStr ? new Date(liveDateStr) : null;

  return t.getRestApi().get(`/checklists/${checklistId}/checkItems`).then((items) => {
    return Promise.all(items.map(item => {
      const config = CHECKLIST_CONFIG[item.name];
      if (!config) return Promise.resolve();

      let dueDate = null;
      if (liveDate) {
        const offsetMs = config.daysBefore * 24 * 60 * 60 * 1000;
        dueDate = new Date(liveDate.getTime() - offsetMs).toISOString();
      }

      let memberId = null;
      if (config.member === 'agent') {
        memberId = cardMembers.length ? cardMembers[0].id : null;
      } else {
        memberId = MEMBER_IDS[config.member];
      }

      const updateUrl = `/cards/${cardId}/checkItem/${item.id}`;
      const body = {};
      if (dueDate) body.due = dueDate;
      if (memberId) body.idMember = memberId;

      return t.getRestApi().put(updateUrl, body);
    }));
  });
}

TrelloPowerUp.initialize({
  'card-buttons': function (t, options) {
    return [{
      icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828911.png',
      text: 'Assign Pre-Listing Tasks',
      callback: function (t) {
        return t.card('id', 'members')
          .then(card => {
            return t.get('card', 'shared', 'liveDate')
              .then(customLiveDate => {
                return t.checklists('all').then(allLists => {
                  const checklist = allLists.find(cl => cl.name === "Pre Listing Checklist");
                  if (!checklist) {
                    alert("Checklist not found.");
                    return;
                  }

                  return assignChecklistItems(
                    t,
                    card.id,
                    checklist.id,
                    card.members,
                    customLiveDate
                  ).then(() => {
                    alert('Checklist items assigned!');
                  });
                });
              });
          });
      }
    }];
  }
});

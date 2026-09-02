
Firestore Structure

users/{userId}
 role: owner/admin/mandor

projects/{projectId}
 name
 location
 contractValue
 progress
 target

projects/{projectId}/materials
 item
 unit
 volume
 price

projects/{projectId}/stock
 materialId
 incoming
 outgoing
 balance

projects/{projectId}/attendance
 worker
 date
 status

projects/{projectId}/reports
 dailyReport
 photos
 issues

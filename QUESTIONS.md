# Developer Questions

If I were starting this project directly with a Product Manager or Stakeholder, I would have asked:

1. **Job Scheduling:** Do we need a concept of "duration" for a job, or simply a start date? Should we prevent double-booking a technician for the same time?
2. **Client Visibility:** Does a client need to approve a job once "completed" before it is strictly finalized? Or does the technician hold the final say?
3. **Scale:** How large is the "small team"? Are we talking 10 technicians or 500? This heavily influences whether we need extensive pagination, search clustering, and indexing strategies.

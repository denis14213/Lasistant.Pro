-- =============================================================================
-- LASISTANT.PRO · Retrait des anciennes photos d'illustration de la médiathèque
--
-- Fichier généré par « npm run db:pages-sql » à partir de src/content : ne pas modifier à la main.
-- Les photos d'illustration fournies avec la première version du site sont remplacées par les
-- photos de l'équipe : leurs fiches sont retirées de la médiathèque. Aucun fichier déposé n'est
-- concerné (storage_path renseigné) et les contenus qui les citent encore affichent la photo de
-- l'équipe correspondante (LEGACY_IMAGE_KEYS). Sans effet sur une base déjà à jour.
-- =============================================================================

delete from public.media
where storage_path is null
  and image = any (array['consultation', 'medicalTeam', 'seniorCare', 'gardenWalk', 'supportiveHands', 'student', 'airportTraveler', 'airplaneWing', 'meeting', 'documents']::text[]);

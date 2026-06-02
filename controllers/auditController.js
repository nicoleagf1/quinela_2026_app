const Audit = require('../models/Audit');
const teamData = require('../utils/teamData');

exports.getAuditList = async (req, res) => {
  try {
    const auditLogs = await Audit.getAuditLogs();
    
    // Add ISO codes to logs for flags
    const enrichedLogs = auditLogs.map(log => {
      const homeIso = teamData[log.home_team] ? teamData[log.home_team].iso : null;
      const awayIso = teamData[log.away_team] ? teamData[log.away_team].iso : null;
      return {
        ...log,
        home_iso: homeIso,
        away_iso: awayIso
      };
    });

    res.render('auditoria', { 
      auditLogs: enrichedLogs,
      activePage: 'auditoria'
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).render('error', { mensaje: 'Error al cargar la auditoría' });
  }
};

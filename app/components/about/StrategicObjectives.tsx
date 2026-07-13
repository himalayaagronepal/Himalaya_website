import connectToDatabase from '../../../lib/mongodb';
import StrategicObjectivesSettings, { STRATEGIC_OBJECTIVES_DEFAULTS } from '../../../models/StrategicObjectivesSettings';
import StrategicObjectivesGrid from './StrategicObjectivesGrid';

async function getData() {
  try {
    await connectToDatabase();
    const doc = await StrategicObjectivesSettings.findOne({ singletonKey: 'strategic-objectives' }).lean();
    if (doc) {
      return {
        badgeText: doc.badgeText || STRATEGIC_OBJECTIVES_DEFAULTS.badgeText,
        heading: doc.heading || STRATEGIC_OBJECTIVES_DEFAULTS.heading,
        description: doc.description ?? STRATEGIC_OBJECTIVES_DEFAULTS.description,
        objectives: Array.isArray(doc.objectives) && doc.objectives.length > 0
          ? doc.objectives
          : STRATEGIC_OBJECTIVES_DEFAULTS.objectives,
      };
    }
  } catch (_) {}
  return {
    badgeText: STRATEGIC_OBJECTIVES_DEFAULTS.badgeText,
    heading: STRATEGIC_OBJECTIVES_DEFAULTS.heading,
    description: STRATEGIC_OBJECTIVES_DEFAULTS.description,
    objectives: STRATEGIC_OBJECTIVES_DEFAULTS.objectives,
  };
}

export default async function StrategicObjectives() {
  const data = await getData();
  return <StrategicObjectivesGrid {...data} />;
}

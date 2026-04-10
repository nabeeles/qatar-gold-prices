const { supabase } = require('./db');
const { Expo } = require('expo-server-sdk');

// Initialize the Expo SDK
let expo = new Expo();

/**
 * Checks all active price alerts and sends push notifications for triggered ones.
 * 
 * Logic:
 * 1. Fetches all active alerts from the price_alerts table.
 * 2. Compares alert target prices with the latest average prices (per karat).
 * 3. Supports two conditions: 'below' (price dropped) and 'above' (price rose).
 * 4. For each triggered alert, constructs a push notification payload.
 * 5. Uses the Expo SDK to send notifications in chunks.
 * 6. Marks triggered alerts as inactive to prevent repeated notifications.
 * 
 * @param {Array<Object>} latestPrices - List of latest average prices (e.g., [{ karat: 24, price: 255 }]).
 */
async function checkAndSendAlerts(latestPrices) {
  console.log('--- Checking Price Alerts ---');
  
  // 1. Fetch active alerts
  const { data: alerts, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching alerts:', error.message);
    return;
  }

  console.log(`Found ${alerts.length} active alerts to check.`);

  const messages = [];
  for (const alert of alerts) {
    // Find matching latest price for this karat
    const currentPriceObj = latestPrices.find(p => p.karat === alert.karat);
    if (!currentPriceObj) continue;

    const currentPrice = currentPriceObj.price;
    let triggered = false;

    if (alert.condition === 'below' && currentPrice <= alert.target_price) triggered = true;
    if (alert.condition === 'above' && currentPrice >= alert.target_price) triggered = true;

    if (triggered) {
      console.log(`🔔 Alert Triggered for User ${alert.user_id}: ${alert.karat}K is ${currentPrice} (Target: ${alert.target_price})`);
      
      if (!Expo.isExpoPushToken(alert.expo_push_token)) {
        console.error(`Push token ${alert.expo_push_token} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: alert.expo_push_token,
        sound: 'default',
        title: '💰 Gold Price Alert!',
        body: `${alert.karat}K Gold is now QAR ${currentPrice}. This is ${alert.condition} your target of ${alert.target_price}!`,
        data: { karat: alert.karat, price: currentPrice },
      });

      // Mark alert as inactive so they don't get spammed
      await supabase.from('price_alerts').update({ is_active: false }).eq('id', alert.id);
    }
  }

  if (messages.length > 0) {
    console.log(`Sending ${messages.length} notifications...`);
    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }
  }
}

module.exports = { checkAndSendAlerts };

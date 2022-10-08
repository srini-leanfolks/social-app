import config from 'config';
import moment from 'moment';
import Helper from '../../Common/Services/authorize.services.js';
import logger from '../resources/Log/logger.log.js';

const helper = new Helper(config.get('authorize'));

export default (req, res, next) => {
  /* #swagger.ignore = true */

  const { state } = req.query;
  let token;

  if (state == null || state == undefined) {
    token = req.headers['x-access-token'];
  }

  if (token) {
    var decodedToken = helper.verifyToken(token);

    if (decodedToken.auth === false) return res.status(401).send('Accesstoken is missing or invalid');

    if (decodedToken) {
      var parsedToken = JSON.parse(decodedToken);

      var expireDate = parsedToken.Activations.account_expire_date;
      var remindingDays = moment(expireDate).diff(moment(), 'days');

      req.body.userScopeId = parsedToken.user_id;
      req.query.userScopeId = parsedToken.user_id;
      req.query.userScopeEmail = parsedToken.email;
      req.body.userScopeEmail = parsedToken.email;
      req.body.userScopeName = parsedToken.first_name;
      req.query.userScopeName = parsedToken.first_name;
      req.body.userScopeMaxAccountCount = parsedToken.userPlanDetails.account_count;
      req.body.userScopeMaxMemberCount = parsedToken.userPlanDetails.member_count;
      req.body.userScopeAvailableNetworks = parsedToken.userPlanDetails.available_network;
      req.body.userScopeMaxScheduleCount = parsedToken.userPlanDetails.maximum_schedule;
      req.body.userScopeIsAdmin = parsedToken.is_admin_user;
      req.query.language = parsedToken.language;

      if (remindingDays < 0) {
        logger.info('\n Expired \n');
        var redirectValueFromRequest = req.query.redirectToken;

        if (redirectValueFromRequest) {
          var decryptredRedirectToken = JSON.parse(helper.decrypt(redirectValueFromRequest));
          var expiredDays = moment(decryptredRedirectToken.expire_date).diff(moment(), 'days');

          if (expiredDays >= 0 && decryptredRedirectToken.isChangePlan) {
            req.body.AppScopedRedirectUrl = decryptredRedirectToken.redirect_url;
            next();
          } else res.status(200).json({ code: 401, status: 'failed', message: 'Something went wrong!' });
        } else {
          var redirectTokenValue = {
            isChangePlan: true,
            expire_date: moment.utc().add(1, 'days'),
            redirect_url: req.originalUrl,
          };
          var redirectToken = helper.encrypt(JSON.stringify(redirectTokenValue));

          res.redirect(`${config.get('user_socioboard.host_url')}/v1/user/change-plan/?userId=${parsedToken.user_id}&currentPlan=${parsedToken.Activations.user_plan}&newPlan=0&redirectToken=${redirectToken}`);
        }
      } else {
        next();
      }
    } else {
      res.status(200).json({ code: 400, status: 'failed', message: 'Bad request!' });
    }
  } else if (state) {
    let decryptedMessage = helper.decrypt(state);

    decryptedMessage = JSON.parse(decryptedMessage);
    req.query.teamId = decryptedMessage.teamId;
    req.query.network = decryptedMessage.network;

    try {
      // Only for Twitter
      if (decryptedMessage.requestToken) {
        req.query.requestToken = decryptedMessage.requestToken;
      }
      if (decryptedMessage.requestSecret) {
        req.query.requestSecret = decryptedMessage.requestSecret;
      }
    } catch (error) {
      logger.info('Twitter state has an issues.');
    }

    var decodedToken = helper.verifyToken(decryptedMessage.accessToken);

    if (decodedToken.auth === false) return res.status(401).send('Accesstoken is missing or invalid');

    if (decodedToken) {
      var parsedToken = JSON.parse(decodedToken);
      var expireDate = parsedToken.Activations.account_expire_date;
      var remindingDays = moment(expireDate).diff(moment(), 'days');

      req.body.userScopeId = parsedToken.user_id;
      req.query.userScopeId = parsedToken.user_id;
      req.query.userScopeEmail = parsedToken.email;
      req.body.userScopeEmail = parsedToken.email;
      req.body.userScopeName = parsedToken.first_name;
      req.query.userScopeName = parsedToken.first_name;
      req.body.userScopeMaxAccountCount = parsedToken.userPlanDetails.account_count;
      req.body.userScopeMaxMemberCount = parsedToken.userPlanDetails.member_count;
      req.body.userScopeAvailableNetworks = parsedToken.userPlanDetails.available_network;
      req.body.userScopeMaxScheduleCount = parsedToken.userPlanDetails.maximum_schedule;
      req.body.userScopeIsAdmin = parsedToken.is_admin_user;
      req.query.language = parsedToken.language;

      if (remindingDays < 0) {
        var redirectValueFromRequest = req.query.redirectToken;

        if (redirectValueFromRequest) {
          var decryptredRedirectToken = JSON.parse(helper.decrypt(redirectValueFromRequest));
          var expiredDays = moment(decryptredRedirectToken.expire_date).diff(moment(), 'days');

          if (expiredDays >= 0 && decryptredRedirectToken.isChangePlan) {
            req.body.AppScopedRedirectUrl = decryptredRedirectToken.redirect_url;
            next();
          } else res.status(200).json({ code: 401, status: 'failed', message: 'Something went wrong!' });
        } else {
          var redirectTokenValue = {
            isChangePlan: true,
            expire_date: moment.utc().add(1, 'days'),
            redirect_url: req.originalUrl,
          };
          var redirectToken = helper.encrypt(JSON.stringify(redirectTokenValue));

          res.redirect(`${config.get('user_socioboard.host_url')}/v1/user/change-plan/?userId=${parsedToken.user_id}&currentPlan=${parsedToken.Activations.user_plan}&newPlan=0&redirectToken=${redirectToken}`);
        }
      } else {
        next();
      }
    } else res.status(200).json({ code: 400, status: 'failed', message: 'Bad request!' });
  } else res.status(200).json({ code: 401, status: 'failed', message: 'Accesstoken is missing or invalid!' });
};

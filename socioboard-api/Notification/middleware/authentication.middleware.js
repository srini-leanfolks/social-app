import config from 'config';
import moment from 'moment';
import AuthorizeServices from '../../Common/Services/authorize.services.js';

export default (req, res, next) => {
  /* #swagger.ignore = true */
  const authorizeService = new AuthorizeServices(config.get('authorize'));
  const { state } = req.query;
  let token;

  if (state == null || state == undefined) {
    token = req.headers['x-access-token'];
  }

  if (token) {
    const decodedToken = authorizeService.verifyToken(token);

    if (decodedToken.auth === false) return res.status(401).send('Access token is missing or invalid');

    if (decodedToken) {
      const parsedToken = JSON.parse(decodedToken);
      const expireDate = parsedToken.Activations.account_expire_date;
      const remindingDays = moment(expireDate).diff(moment(), 'days');

      req.body.userScopeId = parsedToken.user_id;
      req.body.userScopeEmail = parsedToken.email;
      req.body.userScopeName = parsedToken.first_name;
      req.query.userScopeName = parsedToken.first_name;
      req.body.userScopeMaxAccountCount = parsedToken.userPlanDetails.account_count;
      req.body.userScopeMaxMemberCount = parsedToken.userPlanDetails.member_count;
      req.body.userScopeAvailableNetworks = parsedToken.userPlanDetails.available_network;
      req.body.userScopeMaxScheduleCount = parsedToken.userPlanDetails.maximum_schedule;
      req.body.userScopeIsAdmin = parsedToken.is_admin_user;

      if (remindingDays < 0) {
        var redirectValueFromRequest = req.query.redirectToken;

        if (redirectValueFromRequest) {
          var decryptredRedirectToken = JSON.parse(
            authorizeService.decrypt(redirectValueFromRequest),
          );

          var expiredDays = moment(decryptredRedirectToken.expire_date).diff(
            moment(),
            'days',
          );

          if (expiredDays >= 0 && decryptredRedirectToken.isChangePlan) {
            req.body.AppScopedRedirectUrl = decryptredRedirectToken.redirect_url;
            next();
          } else {
            res.status(200).json({
              code: 401,
              status: 'failed',
              message: 'Something went wrong!',
            });
          }
        } else {
          var redirectTokenValue = {
            isChangePlan: true,
            expire_date: moment.utc().add(1, 'days'),
            redirect_url: req.originalUrl,
          };
          var redirectToken = authorizeService.encrypt(
            JSON.stringify(redirectTokenValue),
          );

          res.redirect(
            `${config.get(
              'user_socioboard.host_url',
            )}/v1/user/change-plan/?userId=${parsedToken.user_id}&currentPlan=${parsedToken.Activations.user_plan
            }&newPlan=0&redirectToken=${redirectToken}`,
          );
        }
      } else {
        next();
      }
    } else {
      res
        .status(200)
        .json({ code: 400, status: 'failed', message: 'Bad request!' });
    }
  } else if (state) {
    let decryptedMessage = authorizeService.decrypt(state);

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
      // logger.info("Twitter state has an issues.");
    }

    const decodedToken = authorizeService.verifyToken(
      decryptedMessage.accessToken,
    );

    if (decodedToken.auth === false) return res.status(401).send('Accesstoken is missing or invalid');

    if (decodedToken) {
      const parsedToken = JSON.parse(decodedToken);
      const expireDate = parsedToken.Activations.account_expire_date;
      const remindingDays = moment(expireDate).diff(moment(), 'days');

      req.body.userScopeId = parsedToken.user_id;
      req.body.userScopeEmail = parsedToken.email;
      req.body.userScopeName = parsedToken.first_name;
      req.query.userScopeName = parsedToken.first_name;
      req.body.userScopeMaxAccountCount = parsedToken.userPlanDetails.account_count;
      req.body.userScopeMaxMemberCount = parsedToken.userPlanDetails.member_count;
      req.body.userScopeAvailableNetworks = parsedToken.userPlanDetails.available_network;
      req.body.userScopeMaxScheduleCount = parsedToken.userPlanDetails.maximum_schedule;
      req.body.userScopeIsAdmin = parsedToken.is_admin_user;

      if (remindingDays < 0) {
        var redirectValueFromRequest = req.query.redirectToken;

        if (redirectValueFromRequest) {
          var decryptredRedirectToken = JSON.parse(
            authorizeService.decrypt(redirectValueFromRequest),
          );
          var expiredDays = moment(decryptredRedirectToken.expire_date).diff(
            moment(),
            'days',
          );

          if (expiredDays >= 0 && decryptredRedirectToken.isChangePlan) {
            req.body.AppScopedRedirectUrl = decryptredRedirectToken.redirect_url;
            next();
          } else {
            res.status(200).json({
              code: 401,
              status: 'failed',
              message: 'Something went wrong!',
            });
          }
        } else {
          var redirectTokenValue = {
            isChangePlan: true,
            expire_date: moment.utc().add(1, 'days'),
            redirect_url: req.originalUrl,
          };
          var redirectToken = authorizeService.encrypt(
            JSON.stringify(redirectTokenValue),
          );

          res.redirect(
            `${config.get(
              'user_socioboard.host_url',
            )}/v1/user/change-plan/?userId=${parsedToken.user_id}&currentPlan=${parsedToken.Activations.user_plan
            }&newPlan=0&redirectToken=${redirectToken}`,
          );
        }
      } else {
        next();
      }
    } else {
      res
        .status(200)
        .json({ code: 400, status: 'failed', message: 'Bad request!' });
    }
  } else {
    res.status(200).json({
      code: 401,
      status: 'failed',
      message: 'Accesstoken is missing or invalid!',
    });
  }
};
